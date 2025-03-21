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
const _ = require("lodash");
const ipc = window.require('electron').ipcRenderer;

const Formulaire = forwardRef(({ onSubmit, onError, selectedDegree, speciality }, ref) => {
  const [setError] = useState(false);
  const currentDate = new Date();
  const formattedDate = formatDateFrench(currentDate);
  const academicFullYear = getAcademicYears();

  // Get diploma configuration from diplomaOptions
  const diplomaConfig = diplomaOptions[selectedDegree] ;
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

    for (const batch of arrayOfSelected) {
      for (const item of batch) {
        try {
          const result = Object.fromEntries(
            Object.entries(item).map(([key, v]) => [key.split(' ').join('_'), v])
          );
          const mention = result.Mention ? getMentionEN(result.Mention) : '';

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