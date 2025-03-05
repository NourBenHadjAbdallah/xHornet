import React, { useState, useEffect } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
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
  console.log("check duplicata : ",checkedDuplicata)

  const [loading, setLoading] = useState(false);
  const [pdf, setPdf] = useState("");

  const {
    Diploma,
    lastName,
    firstName,
    mention,
    id,
    LastYear,
    dateProces,
    soutenancePV,
    Year,
    lieu,
    naissance,
    academicFullYear,
  } = formData;


      // French month names
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
    
    
      // Function to format dateProces (from "dd-mm-yyyy" to "dd Month yyyy")
      const formatDateForProces = (dateStr) => {
        if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        const [year, month, day] = dateStr.split('-');
        const monthIndex = parseInt(month, 10) - 1; // Convert to 0-based index
        return `${day} ${months[monthIndex]} ${year}`;
      };

      const formatDateForNaissance = (dateStr) => {
        if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      };



  const handlePreviewClick = () => {
    setShowPreview(true);
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

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network response was not ok");
      const existingPdfBytes = await res.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const base64Image = imageQR64;
      const base64Icon = `data:image/png;base64,${base64Image}`;
      const pngImage = await pdfDoc.embedPng(base64Icon);

      firstPage.drawImage(pngImage, {
        x: 366,
        y: 26,
        width: pngImage.width / 1.4,
        height: pngImage.height / 1.4,
      });

      const form = pdfDoc.getForm();
      form.getTextField("QRText").setText("Application Mobile:QrCheckMobile");
      form.getTextField("FullYear").setText(`${academicFullYear}`);
      form.getTextField("ProcesVerbal").setText(formatDateForProces(dateProces));
      form.getTextField("FullName").setText(`${lastName} ${firstName}`);
      form.getTextField("Birth").setText(formatDateForNaissance(naissance));
      form.getTextField("Lieu").setText(lieu);
      form.getTextField("ID").setText(id);
      form.getTextField("datePermutation").setText(getCurrentDateInFrench());

      if (Diploma === "Licence") {
        form.getTextField("Mention").setText(mention);
      }
      if (Diploma === "Architecture") {
        form.getTextField("SoutenancePV").setText(soutenancePV);
      }

      const pdfBytes = await pdfDoc.save();
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
      disabled={!isActiveFieldsValid() ||!imageQR64}
      onClick={async () => {
        await modifyPdf(); 
        handlePreviewClick(); 
      }}
    >
      {loading ? "Génération..." : "Visualiser Diplôme"}
    </button>
  );
}

export default PdfHandler;