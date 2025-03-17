import React, { useState, useEffect } from "react";
import { modifyPdfTemplate } from "../../helpers/pdfUtils.js";
import configData from "../../helpers/config.json";
const ipc = window.require("electron").ipcRenderer;
const PDFJS = window.pdfjsLib;

function PdfHandler({
  isActiveFieldsValid,
  formData,
  setShowPreview,
  index,
  imageQR64,
  image,
  pdfCallBack,
  checkedDuplicata,
  handlePdfBytesGenerate,
}) {

  const [loading, setLoading] = useState(false);
  const [pdf, setPdf] = useState("");

  const {
    Diploma,
    lastName,
    firstName,
    mention,
    id,
    dateProces,
    soutenancePV,
    lieu,
    naissance,
    academicFullYear,
  } = formData;

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const getCurrentDateInFrench = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    const month = months[today.getMonth()];
    return `${day} ${month} ${year}`;
  };

  const formatDateForProces = (dateStr) => {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const [year, month, day] = dateStr.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    return `${day} ${months[monthIndex]} ${year}`;
  };

  const formatDateForNaissance = (dateStr) => {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const getDiplomaFile = (diploma, checkedDuplicata, index) => {
    let diplomes = configData.DIPLOMAS[diploma].normal;
    let diplomesDuplicata = configData.DIPLOMAS[diploma].duplicata;

    if (diploma === "Architecture") {
      return checkedDuplicata ? diplomesDuplicata[0] + ".pdf" : diplomes[0] + ".pdf";
    }

    return checkedDuplicata
      ? diplomesDuplicata[index - 1] + ".pdf"
      : diplomes[index - 1] + ".pdf";
  };

  async function modifyPdf() {
    setLoading(true);
    const diplomeName = getDiplomaFile(formData.Diploma, checkedDuplicata, index);
    if (!diplomeName) {
      alert("Diplôme introuvable !");
      setLoading(false);
      return;
    }

    const url = `../../assets/${diplomeName}`;

    const formDataForPdf = {
      fullName: `${lastName} ${firstName}`,
      birthDate: naissance,
      birthPlace: lieu,
      id,
      procesVerbal: dateProces,
      mention,
      soutenancePV,
      currentDate: getCurrentDateInFrench(),
    };

    const formatDateFunctions = {
      formatProcesVerbal: formatDateForProces,
      formatCurrentDate: (date) => date,
      formatBirthDate: formatDateForNaissance,
    };

    try {
      const pdfBytes = await modifyPdfTemplate({
        pdfUrl: url,
        qrImageBase64: imageQR64,
        formData: formDataForPdf,
        diplomaType: Diploma,
        academicFullYear,
        formatDateFunctions,
      });

      handlePdfBytesGenerate(pdfBytes);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      const _PDF_DOC = await PDFJS.getDocument({ url: blobUrl }).promise;
      setPdf(_PDF_DOC);
    } catch (error) {
      console.error("Error loading PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF.");
    } finally {
      setLoading(false);
    }
  }

  async function renderPage() {
    var page = await pdf.getPage(1);
    var viewport = page.getViewport(1);
    var render_context = {
      canvasContext: document.querySelector("#pdf-canvas").getContext("2d"),
      viewport: viewport,
    };
    pdfCallBack(viewport.height, viewport.width);
    await page.render(render_context);
    var canvas = document.getElementById("pdf-canvas");
    var img = canvas.toDataURL("image/png");
    image(img);
  }

  useEffect(() => {
    if (pdf) renderPage();
  }, [pdf]);

  return (
    <button
      type="button"
      className={!imageQR64 ? "generate-button-disabled" : "generate-button"}
      disabled={!isActiveFieldsValid() || !imageQR64}
      onClick={async () => {
        await modifyPdf();
        setShowPreview(true);
      }}
    >
      {loading ? "Génération..." : "Visualiser Diplôme"}
    </button>
  );
}

export default PdfHandler;