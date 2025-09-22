import React from "react";
import { generateQrXml, processQrRequest } from "../../helpers/xmlUtils.js";
import { connectToContract, issueDiploma } from "../../helpers/contract.js";
import { generateDiplomaHash, encrypt, toBytes32Hex } from "../../helpers/hashUtils.js";
import configData from "../../helpers/config.json";
import dotenv from 'dotenv';
const ipc = window.require ? window.require("electron").ipcRenderer : null;

dotenv.config();
const PRIVATE_KEY = "79fe3fa380c3b5e244c5cba7a6ef0f503f9adf9e486b562eb804ddc761a16c7d";

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

  async function createFolder() { if (ipc) ipc.send("createFolder", id, speciality, Diploma, academicFullYear, false); }
  async function writeLog() { if (ipc) ipc.send("logFile", id, Diploma, academicFullYear, checkedDuplicata); }

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

      // Generate hash using encrypted fullName and idNumber
      const onChainDiplomaHash = generateDiplomaHash(plainDiplomaData);
      console.log("Generated diploma hash (for on-chain and PDF):", onChainDiplomaHash);

      // Prepare data for contract: encrypt fullName and idNumber, keep others as strings
      const diplomaDataForContract = {
        diplomaHash: onChainDiplomaHash,
        fullName: toBytes32Hex(encrypt(plainDiplomaData.fullName)),
        degree: plainDiplomaData.degree,
        specialty: plainDiplomaData.specialty,
        mention: plainDiplomaData.mention,
        idNumber: toBytes32Hex(encrypt(plainDiplomaData.idNumber)),
        academicYear: plainDiplomaData.academicYear,
        juryMeetingDate: plainDiplomaData.juryMeetingDate,
        directorName: plainDiplomaData.directorName
      };

      console.log("Data for contract (sample):", {
        fullName: diplomaDataForContract.fullName.substring(0, 20) + "...",
        idNumber: diplomaDataForContract.idNumber.substring(0, 20) + "...",
      });

      // Issue with prepared data
      const issueResult = await issueDiploma(contractConnection, diplomaDataForContract);
      console.log("Blockchain issue result:", issueResult);
      if (onHashGenerated) { onHashGenerated({ hash: onChainDiplomaHash, txHash: issueResult.txHash }); }
      return { issueResult, onChainDiplomaHash, plainDiplomaData };
    } catch (error) {
      console.error("Blockchain error:", error.message);
      if (onHashGenerated) { onHashGenerated({ error: error.message }); }
      alert(`Erreur Blockchain: ${error.message}`);
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
          alert(msg);
          setQrHandlingInitiated(false);
          setEnabledhide(false);
          setIsGenerating(false);
        },
        onQrImage: async (image) => {
          setEnabledhide(true);
          if (parentcallback) { parentcallback(image, false, id, speciality, Diploma, academicFullYear); }
          if (callback) { callback(image); }

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
                    alert(`Failed to send email to ${email}: ${emailResult.error}`);
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
        setQrHandlingInitiated(false);
        setEnabledhide(false);
        setIsGenerating(false);
      });

    } catch (error) {
      console.error("Error in generateData after blockchain step:", error);
      setQrHandlingInitiated(false);
      setEnabledhide(false);
      setIsGenerating(false);
    }
  };

  return (
    <button
      className={isDisabled ? "cancel-button-disabled" : "cancel-button"}
      disabled={isDisabled}
      type="button"
      onClick={generateData}
    >
      Générer QR
    </button>
  );
}

export default QrHandling;