import React, { useState, useEffect } from "react"; 
import { generateQrXml, processQrRequest } from "../../helpers/xmlUtils.js";
import { connectToContract, issueDiploma, checkDiplomaExists } from "../../helpers/contract.js";
import { generateDiplomaHash, encryptAES, encryptedToBytes } from "../../helpers/hashUtils.js";
import configData from "../../helpers/config.json";
import { Modal, Box, Typography } from "@material-ui/core";
import dotenv from 'dotenv';
const ipc = window.require ? window.require("electron").ipcRenderer : null;

dotenv.config();
const PRIVATE_KEY = "79fe3fa380c3b5e244c5cba7a6ef0f503f9adf9e486b562eb804ddc761a16c7d";

const modalStyle = {
  margin: 'auto',
  width: '100%',
  bgcolor: '#F44336',
  border: '2px solid #F44336',
  color: 'white',
  p: 2
};

function QrHandling({
  formData,
  parentcallback,
  setEnabledhide,
  isDisabled,
  setQrHandlingInitiated,
  callback,
  onHashGenerated,
  setIsGenerating,
  isGenerating,
  email
}) {
  const {
    Diploma,
    speciality,
    lastName,
    firstName,
    mention,
    id,
    naissance,
    dateProces,
    soutenancePV,
    checkedDuplicata,
    academicFullYear,
  } = formData;

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-dismiss modal 
  useEffect(() => {
    if (errorModalOpen) {
      const timer = setTimeout(() => {
        setErrorModalOpen(false);
        setErrorMessage('');
      }, 15000); 
      return () => clearTimeout(timer); 
    }
  }, [errorModalOpen]);

  async function createFolder() { 
    if (ipc) ipc.send("createFolder", id, speciality, Diploma, academicFullYear, false); 
  }
  
  async function writeLog() { 
    if (ipc) ipc.send("logFile", id, Diploma, academicFullYear, checkedDuplicata); 
  }

  const storeDiplomaToBlockchain = async () => {
    try {
      const contractConnection = await connectToContract(PRIVATE_KEY);
      const plainDiplomaData = {
        fullName: `${lastName} ${firstName}`,
        degree: `${Diploma}`,
        specialty: `${speciality}`,
        mention: `${mention}`,
        idNumber: `${id}`,
        academicYear: academicFullYear,
        juryMeetingDate: dateProces,
        directorName: configData.DIRECTEUR
      };

      const onChainDiplomaHash = generateDiplomaHash(plainDiplomaData);
      console.log("Generated diploma hash (for on-chain and PDF):", onChainDiplomaHash);

      // Check if diploma already exists
      const diplomaCheck = await checkDiplomaExists(contractConnection, onChainDiplomaHash);
      if (diplomaCheck.exists) {
        throw new Error("Ce diplôme existe déjà sur la blockchain. Veuillez vérifier les données saisies.");
      }

      // Encrypt sensitive fields using AES-256-CBC
      console.log("Encrypting fullName and idNumber with AES-256-CBC");
      const encryptedFullName = encryptAES(plainDiplomaData.fullName);
      const encryptedIdNumber = encryptAES(plainDiplomaData.idNumber);

      // Convert to hex bytes for Solidity
      const fullNameBytes = encryptedToBytes(encryptedFullName);
      const idNumberBytes = encryptedToBytes(encryptedIdNumber);

      const diplomaDataForContract = {
        diplomaHash: onChainDiplomaHash,
        fullName: fullNameBytes,
        degree: plainDiplomaData.degree,
        specialty: plainDiplomaData.specialty,
        mention: plainDiplomaData.mention,
        idNumber: idNumberBytes,
        academicYear: plainDiplomaData.academicYear,
        juryMeetingDate: plainDiplomaData.juryMeetingDate,
        directorName: plainDiplomaData.directorName
      };

      console.log("Data for contract (encrypted fields):", {
        fullName: diplomaDataForContract.fullName.substring(0, 20) + "...",
        idNumber: diplomaDataForContract.idNumber.substring(0, 20) + "...",
      });

      const issueResult = await issueDiploma(contractConnection, diplomaDataForContract);
      console.log("Blockchain issue result:", issueResult);
      
      if (onHashGenerated) { 
        onHashGenerated({ hash: onChainDiplomaHash, txHash: issueResult.txHash }); 
      }
      
      return { issueResult, onChainDiplomaHash, plainDiplomaData };
    } catch (error) {
      console.error("Full Blockchain error object:", error);
      let detailedMessage = error.message;
      
      if (error.reason) {
        detailedMessage = `Erreur Blockchain: ${error.reason}`;
      } else if (error.error && error.error.data && error.error.data.message) {
        detailedMessage = `Erreur Blockchain: ${error.error.data.message}`;
      } else if (error.data) {
        detailedMessage = `Erreur Blockchain: ${error.data}`;
      } else if (error.message.includes("Ce diplôme existe déjà")) {
        detailedMessage = error.message; 
      }
      
      console.error("Blockchain error:", detailedMessage);
      
      if (onHashGenerated) { 
        onHashGenerated({ error: detailedMessage }); 
      }
      
      setErrorMessage(detailedMessage);
      setErrorModalOpen(true);
      throw error;
    }
  };

  const generateData = async () => {
    if (isDisabled || isGenerating) return;

    setIsGenerating(true);
    setQrHandlingInitiated(true);
    setEnabledhide(false);

    try {
      let onChainDiplomaHash = null;
      let issueResult = null;
      let plainDiplomaData = null;

      if (!checkedDuplicata) {
        const blockchainResponse = await storeDiplomaToBlockchain();
        issueResult = blockchainResponse.issueResult;
        onChainDiplomaHash = blockchainResponse.onChainDiplomaHash;
        plainDiplomaData = blockchainResponse.plainDiplomaData;
      } else {
        if (onHashGenerated) {
          onHashGenerated({ hash: null, txHash: null });
        }
      }

      createFolder();
      writeLog();

      const xmlsFR = generateQrXml({
        diplomaType: Diploma,
        fullName: `${lastName} ${firstName}`,
        id,
        birthDate: naissance,
        academicFullYear: academicFullYear,
        dateProces,
        mention: mention,
        soutenancePV,
      });

      processQrRequest(xmlsFR, {
        onSuccess: () => {},
        onError: (msg) => {
          setErrorMessage(msg);
          setErrorModalOpen(true);
          setQrHandlingInitiated(false);
          setEnabledhide(false);
          setIsGenerating(false);
        },
        onQrImage: async (image) => {
          setEnabledhide(true);
          if (parentcallback) { 
            parentcallback(image, false, id, speciality, Diploma, academicFullYear); 
          }
          if (callback) { 
            callback(image); 
          }

          if (email && onChainDiplomaHash && plainDiplomaData) { 
            const diplomaLink = `http://localhost:5173/?hash=${onChainDiplomaHash}`;
            
            const emailData = {
              recipientEmail: email,
              fullName: plainDiplomaData.fullName,
              diplomaType: plainDiplomaData.degree,
              academicFullYear: plainDiplomaData.academicYear,
              diplomaLink: diplomaLink,
            };

            if (ipc) {
              const emailResult = await new Promise((resolve) => {
                ipc.once('send-email-ipc-reply', (event, response) => {
                  resolve(response);
                });
                ipc.send('send-email-ipc', emailData);
              });

              if (emailResult.success) {
                console.log(`Email sent successfully to ${email}`);
              } else {
                console.error(`Failed to send email to ${email}:`, emailResult.error);
                setErrorMessage(`Failed to send email to ${email}: ${emailResult.error}`);
                setErrorModalOpen(true);
              }
            } else {
              console.warn("IPC not available. Cannot send email.");
            }
          } else if (!email) {
            console.warn("No email address provided. Skipping email sending.");
          } else if (!onChainDiplomaHash) {
            console.warn("No on-chain diploma hash generated. Skipping email sending with proof link.");
          }

          setIsGenerating(false);
        },
      }).catch((err) => {
        console.error("QR Generation Error:", err);
        setErrorMessage(`Erreur de génération QR: ${err.message}`);
        setErrorModalOpen(true);
        setQrHandlingInitiated(false);
        setEnabledhide(false);
        setIsGenerating(false);
      });

    } catch (error) {
      console.error("Error in generateData after blockchain step:", error);
      setErrorMessage(`Erreur: ${error.message}`);
      setErrorModalOpen(true);
      setQrHandlingInitiated(false);
      setEnabledhide(false);
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        className={isDisabled ? "cancel-button-disabled" : "cancel-button"}
        disabled={isDisabled}
        type="button"
        onClick={generateData}
      >
        Générer QR
      </button>
      <Modal
        open={errorModalOpen}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">Erreur</Typography>
          <Typography component="span">{errorMessage}</Typography>
        </Box>
      </Modal>
    </>
  );
}

export default QrHandling;