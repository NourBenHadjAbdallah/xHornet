import React, { useState, forwardRef, useImperativeHandle, useRef } from "react";
import '../css/main-interface.css';
import { modifyPdfTemplate } from "../helpers/pdfUtils.js";
import { generateQrXml, processQrRequest } from "../helpers/xmlUtils.js";
import { specialtiesMapping, diplomaOptions, getDiplomaFile, getAcademicYears, formatDateFrench, toMonthNameFrenchPV } from "../helpers/diplomaUtils.js";
import { connectToContract, storeDiplomasBatch, checkDiplomaExists } from "../helpers/contract.js";
import { encryptAES, encryptedToBytes, generateDiplomaHash } from "../helpers/hashUtils.js";
import { checkBalanceForTx } from "../helpers/LimitAlert.js";
import { Modal, Box, Typography, Button, IconButton } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import configData from "../helpers/config.json";

const _ = require("lodash");
const ipc = window.require('electron').ipcRenderer;
const ethers = require("ethers");

const PRIVATE_KEY = "79fe3fa380c3b5e244c5cba7a6ef0f503f9adf9e486b562eb804ddc761a16c7d";

const modalStyle = {
  margin: 'auto',
  width: '100%',
  maxWidth: 400,
  bgcolor: '#F44336',
  border: '2px solid #F44336',
  color: 'white',
  p: 2,
  textAlign: 'center'
};

const modalStyleWarning = {
  margin: 'auto',
  width: '100%',
  maxWidth: 400,
  bgcolor: '#FFC107',
  border: '2px solid #FFC107',
  color: 'black',
  p: 2,
  textAlign: 'left'
};

const Formulaire = forwardRef(({ onSubmit, onError, selectedDegree, speciality }, ref) => {
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [error, setError] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
  const isMounted = useRef(true); // Track mounted state

  const currentDate = new Date();
  const formattedDate = formatDateFrench(currentDate);
  const academicFullYear = getAcademicYears();

  const diplomaConfig = diplomaOptions[selectedDegree];
  const diplomaName = diplomaConfig.value;
  const diplomaFR = diplomaName;
  const directorName = configData.DIRECTEUR;

  useImperativeHandle(ref, () => ({
    createFolder(rows) {
      modifyPdf(rows);
    }
  }));

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMounted.current = false; // Mark as unmounted
    };
  }, []);

  const getSpecialty = (input) => specialtiesMapping[input] || '';

  const modifyPdf = async (rows) => {
    if (!isMounted.current) return; // Exit if unmounted

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      if (isMounted.current) {
        setError(true);
        onError(true);
        setErrorMessage("Aucune donnée valide fournie pour le traitement.");
        setErrorModalOpen(true);
      }
      return;
    }

    const diplomeFileName = getDiplomaFile(speciality, selectedDegree);
    const url = `./assets/${diplomeFileName}`;
    const specialtyName = getSpecialty(speciality);
    const chunkSize = 50;

    let processedCount = 0;
    const totalItems = rows.length;
    let duplicateList = [];

    let contractConnection = null;
    let allBatchTxHashes = [];

    try {
      contractConnection = await connectToContract(PRIVATE_KEY);

      // Detect duplicates before processing
      const potentialDiplomas = rows.map(item => {
        const result = Object.fromEntries(
          Object.entries(item).map(([key, v]) => [key.split(' ').join('_'), v])
        );

        const fullName = result.Prénom_NOM;
        const degree = diplomaName;
        const specialty = specialtyName;
        const mention = result.Mention;
        const idNumber = result.CIN;
        const academicYear = academicFullYear;
        const juryMeetingDate = result.PV;

        const diplomaHash = generateDiplomaHash({
          fullName,
          degree,
          specialty,
          mention,
          idNumber,
          academicYear,
          juryMeetingDate,
          directorName
        });

        return { hash: diplomaHash, fullName, cin: idNumber, originalItem: item };
      });

      const checks = await Promise.all(potentialDiplomas.map(async (dip) => {
        try {
          const diplomaCheck = await checkDiplomaExists(contractConnection, dip.hash);
          return { ...dip, exists: diplomaCheck.exists };
        } catch (err) {
          console.error("Error checking diploma existence:", err);
          return { ...dip, exists: false };
        }
      }));

      duplicateList = checks.filter(d => d.exists).map(d => ({ fullName: d.fullName, cin: d.cin }));
      const nonDuplicateRows = checks.filter(d => !d.exists).map(d => d.originalItem);

      // Show duplicates modal immediately after detection
      if (duplicateList.length > 0 && isMounted.current) {
        setDuplicates(duplicateList);
        setShowDuplicatesModal(true);
      }

      if (nonDuplicateRows.length === 0) {
        if (isMounted.current) {
          setError(true);
          onError(true);
          setErrorMessage("Tous les diplômes fournis sont des doublons. Aucun traitement effectué.");
          setErrorModalOpen(true);
        }
        return;
      }

      // Proceed with non-duplicates
      rows = nonDuplicateRows;
      const totalItems = rows.length; // Update totalItems

      const arrayOfSelected = _.chunk(rows, chunkSize);

      if (arrayOfSelected.length > 0) {
        const sampleBatch = arrayOfSelected[0].map(item => {
          const result = Object.fromEntries(
            Object.entries(item).map(([key, v]) => [key.split(' ').join('_'), v])
          );

          const fullName = result.Prénom_NOM;
          const degree = diplomaName;
          const specialty = specialtyName;
          const mention = result.Mention;
          const idNumber = result.CIN;
          const academicYear = academicFullYear;
          const juryMeetingDate = result.PV;

          const encryptedFullName = encryptAES(fullName);
          const encryptedIdNumber = encryptAES(idNumber);

          const fullNameBytes = encryptedToBytes(encryptedFullName);
          const idNumberBytes = encryptedToBytes(encryptedIdNumber);

          const diplomaHash = generateDiplomaHash({
            fullName,
            degree,
            specialty,
            mention,
            idNumber,
            academicYear,
            juryMeetingDate,
            directorName
          });

          return {
            diplomaHash: diplomaHash,
            fullName: fullNameBytes,
            degree: degree,
            specialty: specialty,
            mention: mention,
            idNumber: idNumberBytes,
            academicYear: academicYear,
            juryMeetingDate: juryMeetingDate,
            directorName: directorName,
          };
        });
        await checkBalanceForTx(contractConnection, 'storeDiplomasBatch', [sampleBatch]);
      }

      for (const batch of arrayOfSelected) {
        const diplomasForBatchIssuance = batch.map(item => {
          const result = Object.fromEntries(
            Object.entries(item).map(([key, v]) => [key.split(' ').join('_'), v])
          );

          const fullName = result.Prénom_NOM;
          const degree = diplomaName;
          const specialty = specialtyName;
          const mention = result.Mention;
          const idNumber = result.CIN;
          const academicYear = academicFullYear;
          const juryMeetingDate = result.PV;

          const encryptedFullName = encryptAES(fullName);
          const encryptedIdNumber = encryptAES(idNumber);

          const fullNameBytes = encryptedToBytes(encryptedFullName);
          const idNumberBytes = encryptedToBytes(encryptedIdNumber);


          const diplomaHash = generateDiplomaHash({
            fullName,
            degree,
            specialty,
            mention,
            idNumber,
            academicYear,
            juryMeetingDate,
            directorName
          });

          return {
            diplomaHash: diplomaHash,
            fullName: fullNameBytes,
            degree: degree,
            specialty: specialty,
            mention: mention,
            idNumber: idNumberBytes,
            academicYear: academicYear,
            juryMeetingDate: juryMeetingDate,
            directorName: directorName,
          };
        });

        await checkBalanceForTx(contractConnection, 'storeDiplomasBatch', [diplomasForBatchIssuance]);

        const batchResult = await storeDiplomasBatch(contractConnection, diplomasForBatchIssuance);
        allBatchTxHashes.push(batchResult.txHash);
        console.log("Diplomas Batch Issued on Blockchain:", batchResult);

        for (const item of batch) {
          try {
            const result = Object.fromEntries(
              Object.entries(item).map(([key, v]) => [key.split(' ').join('_'), v])
            );
            const mention = result.Mention;

            const currentDiplomaDataForHash = {
              fullName: result.Prénom_NOM,
              degree: diplomaName,
              specialty: specialtyName,
              mention: mention,
              idNumber: result.CIN,
              academicYear: academicFullYear,
              juryMeetingDate: result.PV,
              directorName: directorName,
            };

            const currentDiplomaHash = generateDiplomaHash(currentDiplomaDataForHash);

            const currentBatchTxHash = batchResult.txHash;

            const proofData = {
              diplomaData: currentDiplomaDataForHash,
              diplomaHash: currentDiplomaHash,
              batchTxHash: currentBatchTxHash,
            };

            const xmls = generateQrXml({
              diplomaType: diplomaName,
              fullName: result.Prénom_NOM,
              id: result.CIN,
              specialty: specialtyName,
              birthDate: result.date_de_naissance,
              academicFullYear,
              dateProces: result.PV,
              mention,
            });

            const qrImage = await processQrRequest(xmls, {
              onError: (msg) => { throw new Error(msg); },
              onQrImage: (image) => image,
            });

            const formData = {
              fullName: result.Prénom_NOM,
              birthDate: result.date_de_naissance,
              birthPlace: result.lieu_de_naissance,
              id: result.CIN,
              procesVerbal: result.PV,
              mention: result.Mention || '',
              soutenancePV: result.PV || '',
              currentDate: formattedDate,
            };

            const formatDateFunctions = {
              formatProcesVerbal: (date) => `${date.slice(0, 2)} ${toMonthNameFrenchPV(date.substring(3, 5))} ${date.slice(6)}`,
              formatCurrentDate: (date) => `${date.slice(0, 2)} ${toMonthNameFrenchPV(date.substring(3, 5))} ${date.slice(6)}`,
              formatBirthDate: (date) => date,
            };

            const pdfBytes = await modifyPdfTemplate({
              pdfUrl: url,
              qrImageBase64: qrImage,
              formData,
              diplomaType: diplomaName,
              specialtyName,
              academicFullYear,
              formatDateFunctions,
            });
            const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
            const jsonBase64 = Buffer.from(JSON.stringify(proofData)).toString('base64');

            const baseVerificationUrl = 'http://localhost:5174';
            const diplomaLink = `${baseVerificationUrl}/?` + new URLSearchParams({
              hash: proofData.diplomaHash,
            }).toString();

            if (result.Email) {
              const emailData = {
                recipientEmail: result.Email,
                fullName: result.Prénom_NOM,
                diplomaType: diplomaName,
                academicFullYear: academicFullYear,
                pdfBase64: pdfBase64,
                jsonBase64: jsonBase64,
                diplomaLink: diplomaLink,
              };

              const emailResult = await new Promise((resolve) => {
                ipc.once('send-email-ipc-reply', (event, response) => {
                  resolve(response);
                });
                ipc.send('send-email-ipc', emailData);
              });

              if (emailResult.success) {
                console.log(`Email sent successfully to ${result.Email}`);
              } else {
                console.error(`Failed to send email to ${result.Email}:`, emailResult.error);
                if (isMounted.current) {
                  setErrorMessage(`Échec de l'envoi de l'email à ${result.Email}: ${emailResult.error}`);
                  setErrorModalOpen(true);
                }
              }
            } else {
              console.warn(`No email address found for ${result.Prénom_NOM}. Skipping email.`);
            }

            ipc.send('createFolder', result.CIN, specialtyName, diplomaFR, academicFullYear, true);
            ipc.send("logFile", result.CIN, diplomaFR, academicFullYear, false, true);
            ipc.send('downloadPDF', result.CIN, specialtyName, diplomaFR, false, academicFullYear, pdfBytes, true);

            if (isMounted.current) {
              processedCount += 1;
              onSubmit((processedCount / totalItems) * 100);
            }
          } catch (err) {
            console.error("Error processing item:", err);
            if (isMounted.current) {
              setError(true);
              onError(true);
              setErrorMessage(`Erreur de traitement: ${err.message}`);
              setErrorModalOpen(true);
            }
          }
        }
      }

    } catch (blockchainError) {
      console.error("Error with batch blockchain registration:", blockchainError);
      if (isMounted.current) {
        setError(true);
        onError(true);
        setErrorMessage(`Erreur lors de l'enregistrement des diplômes sur la blockchain: ${blockchainError.message}`);
        setErrorModalOpen(true);
      }
      return;
    }
  };

  return (
    <>
      {errorModalOpen && (
        <Modal
          open={errorModalOpen}
          onClose={() => setErrorModalOpen(false)}
          sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Box sx={modalStyle}>
            <Typography variant="h6" component="h2">Erreur</Typography>
            <Typography component="span">{errorMessage}</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setErrorModalOpen(false)}
              sx={{ mt: 2 }}
            >
              Fermer
            </Button>
          </Box>
        </Modal>
      )}
      {showDuplicatesModal && (
        <Modal
          open={showDuplicatesModal}
          onClose={() => setShowDuplicatesModal(false)}
          sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Box sx={modalStyleWarning}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="h2">Avertissement: Doublons détectés</Typography>
              <IconButton onClick={() => setShowDuplicatesModal(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Typography component="p">Les diplômes suivants sont des doublons et ont été ignorés :</Typography>
            <ul>
              {duplicates.map((dup, index) => (
                <li key={index}>
                  Diplôme de {dup.fullName} | CIN: {dup.cin}
                </li>
              ))}
            </ul>
          </Box>
        </Modal>
      )}
    </>
  );
});

export default Formulaire;