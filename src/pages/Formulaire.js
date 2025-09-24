import { useState, forwardRef, useImperativeHandle } from "react";
   import '../css/main-interface.css';
   import { modifyPdfTemplate } from "../helpers/pdfUtils.js";
   import { generateQrXml, processQrRequest } from "../helpers/xmlUtils.js";
   import {
     specialtiesMapping,
     mentionOptions,
     diplomaOptions,
     specialtiesMappingEN,
     mentionMappingEN,
     getDiplomaFile,
     getAcademicYears,
     formatDateFrench,
     toMonthNameFrenchPV
   } from "../helpers/diplomaUtils.js";
   import { connectToContract, storeDiplomasBatch } from "../helpers/contract.js";
   import { encrypt, toBytes32Hex, generateDiplomaHash } from "../helpers/hashUtils.js";
   import configData from "../helpers/config.json";

   const _ = require("lodash");
   const ipc = window.require('electron').ipcRenderer;
   const ethers = require("ethers");

   const PRIVATE_KEY = "79fe3fa380c3b5e244c5cba7a6ef0f503f9adf9e486b562eb804ddc761a16c7d";

   const Formulaire = forwardRef(({ onSubmit, onError, selectedDegree, speciality }, ref) => {

     const [setError] = useState(false);

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

     const getSpecialty = (input) => specialtiesMapping[input] || '';

     const modifyPdf = async (rows) => {
       if (!rows || !Array.isArray(rows) || rows.length === 0) {
         setError(true);
         onError(true);
         return;
       }

       const diplomeFileName = getDiplomaFile(speciality, selectedDegree);
       const url = `./assets/${diplomeFileName}`;
       const specialtyName = getSpecialty(speciality);
       const chunkSize = 50; // Reduce chunk size for blockchain transactions
       const arrayOfSelected = _.chunk(rows, chunkSize); // Chunk for both PDF and blockchain

       let processedCount = 0;
       const totalItems = rows.length;

       let contractConnection = null;
       let allBatchTxHashes = []; // To store transaction hashes of all batches

       try {
         contractConnection = await connectToContract(PRIVATE_KEY);

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

             // Encrypt fullName and idNumber for storage
             const encryptedFullName = toBytes32Hex(encrypt(fullName));
             const encryptedIdNumber = toBytes32Hex(encrypt(idNumber));

             const diplomaHash = generateDiplomaHash({
               fullName, // Plaintext for hashing
               degree,
               specialty,
               mention,
               idNumber, // Plaintext for hashing
               academicYear,
               juryMeetingDate,
               directorName
             });

             return {
               diplomaHash: diplomaHash,
               fullName: encryptedFullName,
               degree: degree,
               specialty: specialty,
               mention: mention,
               idNumber: encryptedIdNumber,
               academicYear: academicYear,
               juryMeetingDate: juryMeetingDate,
               directorName: directorName,
             };
           });

           // Issue diplomas in a smaller batch for the smart contract
           const batchResult = await storeDiplomasBatch(contractConnection, diplomasForBatchIssuance);
           allBatchTxHashes.push(batchResult.txHash); // Store the tx hash for each batch
           console.log("Diplomas Batch Issued on Blockchain:", batchResult);

           // Process PDFs and send emails for the current batch
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

               // For the diploma link, we need to associate it with one of the batch transaction hashes.
               // For simplicity, we'll use the hash of the batch it was included in.
               const currentBatchTxHash = batchResult.txHash; // Use the tx hash of the current batch

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
                   alert(`Failed to send email to ${result.Email}: ${emailResult.error}`);
                 }
               } else {
                 console.warn(`No email address found for ${result.Prénom_NOM}. Skipping email.`);
               }

               ipc.send('createFolder', result.CIN, specialtyName, diplomaFR, academicFullYear, true);
               ipc.send("logFile", result.CIN, diplomaFR, academicFullYear, false, true);
               ipc.send('downloadPDF', result.CIN, specialtyName, diplomaFR, false, academicFullYear, pdfBytes, true);

               processedCount += 1;
               onSubmit((processedCount / totalItems) * 100);
             } catch (err) {
               console.error("Error processing item:", err);
               setError(true);
               onError(true);
               // Continue processing other items in the batch or decide to stop the entire process
             }
           }
         }
       } catch (blockchainError) {
         console.error("Error with batch blockchain registration:", blockchainError);
         setError(true);
         onError(true);
         alert("Erreur lors de l'enregistrement des diplômes sur la blockchain. Veuillez réessayer.");
         return;
       }
     };

     return null;
   });

   export default Formulaire;