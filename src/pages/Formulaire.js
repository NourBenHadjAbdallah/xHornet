import { useState, forwardRef, useImperativeHandle } from "react";
import '../css/main-interface.css';
import { modifyPdfTemplate } from "../helpers/pdfUtils.js";
import { generateQrXml, processQrRequest } from "../helpers/xmlUtils.js";
import {
  diplomaOptions,
  specialtiesMappingEN,
  mentionMappingEN,
  getDiplomaFile,
  getAcademicYears,
  formatDateFrench, 
  toMonthNameFrenchPV
} from "../helpers/diplomaUtils.js";
import { buildMerkleTree } from "../helpers/merkleUtils.js";
import { connectToContract, registerBatchRoot } from "../helpers/contract.js";
const _ = require("lodash");
const ipc = window.require('electron').ipcRenderer;

const PRIVATE_KEY = "79fe3fa380c3b5e244c5cba7a6ef0f503f9adf9e486b562eb804ddc761a16c7d";

const Formulaire = forwardRef(({ onSubmit, onError, selectedDegree, speciality }, ref) => {

  const [setError] = useState(false);

  const currentDate = new Date();
  const formattedDate = formatDateFrench(currentDate);
  const academicFullYear = getAcademicYears();

  const diplomaConfig = diplomaOptions[selectedDegree];
  const diplomaName = diplomaConfig.value;
  const diplomaFR = diplomaName;

  useImperativeHandle(ref, () => ({
    createFolder(rows) {
      modifyPdf(rows);
    }
  }));

  const getSpecialtyEN = (input) => specialtiesMappingEN[input] || '';
  const getMentionEN = (input) => mentionMappingEN[input.toLowerCase()] || '';

  const modifyPdf = async (rows) => {
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      setError(true);
      onError(true);
      return;
    }

    const diplomeFileName = getDiplomaFile(speciality, selectedDegree);
    const url = `./assets/${diplomeFileName}`;
    const specialtyName = getSpecialtyEN(speciality);
    const arrayOfSelected = _.chunk(rows, 10);

    let processedCount = 0;
    const totalItems = rows.length;

    let merkleRoot = null;
    let merkleTree = null;
    let contractConnection = null;

    try {
      const diplomasForMerkle = rows.map(item => {
        const result = Object.fromEntries(
          Object.entries(item).map(([key, v]) => [key.split(' ').join('_'), v])
        );
        return {
          fullName: result.Prénom_NOM,
          studentId: result.CIN,
          degree: diplomaName,
          speciality: specialtyName,
          academicFullYear: academicFullYear
        };
      });

      const merkleResult = buildMerkleTree(diplomasForMerkle);
      merkleTree = merkleResult.merkleTree;
      merkleRoot = merkleResult.merkleRoot;

      contractConnection = await connectToContract(PRIVATE_KEY);
      const registerResult = await registerBatchRoot(contractConnection, merkleRoot);
      console.log("Merkle Root Registered on Blockchain:", registerResult);

    } catch (blockchainError) {
      console.error("Error with batch blockchain registration:", blockchainError);
      setError(true);
      onError(true);
      alert("Erreur lors de l'enregistrement du Merkle Root sur la blockchain. Veuillez réessayer.");
      return;
    }

    for (const batch of arrayOfSelected) {
      for (const item of batch) {
        try {
          const result = Object.fromEntries(
            Object.entries(item).map(([key, v]) => [key.split(' ').join('_'), v])
          );
          const mention = result.Mention ? getMentionEN(result.Mention) : '';

          const currentDiplomaForLeaf = {
            fullName: result.Prénom_NOM,
            studentId: result.CIN,
            degree: diplomaName,
            speciality: specialtyName,
            academicFullYear: academicFullYear
          };
          const { ethers } = require("ethers");
          const currentLeafHash = ethers.utils.solidityKeccak256(
            ['string', 'string', 'string', 'string', 'string'],
            [
                currentDiplomaForLeaf.fullName,
                currentDiplomaForLeaf.studentId,
                currentDiplomaForLeaf.degree,
                currentDiplomaForLeaf.speciality,
                currentDiplomaForLeaf.academicFullYear
            ]
          );

          const merkleProof = merkleTree.getHexProof(currentLeafHash);

          const proofData = {
            diplomaData: currentDiplomaForLeaf,
            leafHash: currentLeafHash,
            merkleRoot: merkleRoot,
            merkleProof: merkleProof,
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
          ipc.send('createFolder', result.CIN, specialtyName, diplomaFR, academicFullYear, true);
          ipc.send("logFile", result.CIN, diplomaFR, academicFullYear, false, true);
          ipc.send('downloadPDF', result.CIN, specialtyName, diplomaFR, false, academicFullYear, pdfBytes, true);
          ipc.send('downloadProof', result.CIN, specialtyName, diplomaFR, false, academicFullYear, JSON.stringify(proofData), true)

          processedCount += 1;
          onSubmit((processedCount / totalItems) * 100);
        } catch (err) {
          console.error("Error processing item:", err); 
          setError(true);
          onError(true);
          return;
        }
      }
    }
  };

  return null;
});

export default Formulaire;