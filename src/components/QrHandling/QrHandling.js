import React from "react";
import { generateQrXml, processQrRequest } from "../../helpers/xmlUtils.js";
const ipc = window.require("electron").ipcRenderer;

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

  const generateData = () => {
    setQrHandlingInitiated(true);

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