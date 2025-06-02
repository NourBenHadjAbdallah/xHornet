import React from "react";
import { generateQrXml, processQrRequest } from "../../helpers/xmlUtils.js";
import { connectToContract, issueDiploma } from "../../helpers/contract.js";
import { generateDiplomaHash } from "../../helpers/hashUtils.js";
const ipc = window.require("electron").ipcRenderer;
const PRIVATE_KEY = "79fe3fa380c3b5e244c5cba7a6ef0f503f9adf9e486b562eb804ddc761a16c7d";

function QrHandling({ formData, parentcallback, setEnabledhide, isDisabled, setQrHandlingInitiated, callback }) {
  const {
    Diploma,
    specialty,
    lastName,
    firstName,
    mention,
    id,
    naissance,
    LastYear,
    Year,
    dateProces,
    soutenancePV,
    checkedDuplicata,
    academicFullYear,
  } = formData;


  async function createFolder() {ipc.send("createFolder", id, specialty, Diploma, academicFullYear, false);}
  async function writeLog() {ipc.send("logFile", id, Diploma, academicFullYear, checkedDuplicata);}
  const storeDiplomaToBlockchain = async () => {
    try {
      const contractConnection = await connectToContract(PRIVATE_KEY);

      const diplomaData = {
        fullName: `${lastName} ${firstName}`,
        degree: `${Diploma} ${specialty}`,
        academicFullYear: academicFullYear,
      };

      const diplomaHash = generateDiplomaHash(diplomaData);
      console.log("Generated diploma hash:", diplomaHash);

      await issueDiploma(contractConnection, {
        ...diplomaData,
        hash: diplomaHash,
      });

    } catch (error) {
      console.error("Blockchain error:", error.message);
      throw error;
    }
  };


  const generateData = () => {
    setQrHandlingInitiated(true);
    storeDiplomaToBlockchain();


    const xmlsFR = generateQrXml({
      diplomaType: Diploma,
      fullName: `${lastName} ${firstName}`,
      id,
      specialty,
      birthDate: naissance,
      academicFullYear: `${LastYear}-${Year}`,
      dateProces,
      mention: mention, 
      soutenancePV,
    });

    processQrRequest(xmlsFR, {
      onSuccess: () => {
        createFolder();
        writeLog();
      },
      onError: (msg) => {
        alert(msg);
      },
      onQrImage: (image) => {
        setEnabledhide(true);
        if (parentcallback) {
          parentcallback(image, false, id, specialty, Diploma, academicFullYear);
        }
        if (callback) {
          callback(image);
        }
      },
    }).catch((err) => {
      console.error("QR Generation Error:", err);
    });
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