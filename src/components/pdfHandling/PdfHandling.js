import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import configData from "../../helpers/config.json";
import "../pdfHandling/pdfHandlingStyle.css"

function PdfHendling({imageQR64,checkedDuplicata, diploma, formData, index }) {
  const [pdfBytes, setPdfBytes] = useState(null);
  const [pdfURL, setPdfURL] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state


  const {
    lastName,
    firstName,
    mention,
    id,
    LastYear, 
    Year,
    lieu,
    naissance,
    dateProces,
    soutenancePV,
    academicFullYear,
  } = formData;

  const getDiplomaFile = (diploma, checkedDuplicata, index) => {

    let diplomes = configData.DIPLOMAS[diploma].normal;
    let diplomesDuplicata = configData.DIPLOMAS[diploma].duplicata;
  
    return checkedDuplicata
      ? diplomesDuplicata[index -1] + ".pdf"
      : diplomes[index -1] + ".pdf";
  };


  async function modifyPdf() {
    setLoading(true); // Set loading state to true
    const diplomeName = getDiplomaFile(diploma, checkedDuplicata, index); // Pass parameters here
    if (!diplomeName) {
      alert("Diplôme introuvable !");
      setLoading(false); // Reset loading state
      console.log(diplomeName)
      return;
    }

    const url = `../../assets/${diplomeName}`;
    try {
      const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Embed fonts
      const timesNewRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesNewRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const base64Image = imageQR64;
      const base64Icon = `data:image/png;base64,${base64Image}`;
      const pngImage = await pdfDoc.embedPng(base64Icon);
      //Draw an image
      firstPage.drawImage(pngImage, {
        x: 366,
        y:  26,
        width: pngImage.width  / 1.4,
        height: pngImage.height  / 1.4,
      });



      // Draw the QR code and other text
    firstPage.drawText("Application Mobile:QrCheckMobile", {
      x: 359,
      y:  30,
      size: 8,
      font: timesNewRomanFont,
      color: rgb(0, 0, 0),
    });

      firstPage.drawText(`${LastYear}-${Year}`, {
        x: 371,
        y: 375.5,
        size: 9,
        font: timesNewRomanFont,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(dateProces, {
        x: 547,
        y: 375.5,
        size: 9,
        font: timesNewRomanFont,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(soutenancePV, {
        x: 359,
        y: 310.5,
        size: 9,
        font: timesNewRomanFont,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(`${lastName} ${firstName}`, {
        x: 110,
        y: 178,
        size: 14,
        font: timesNewRomanBoldFont,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(naissance, {
        x: diploma==='Architecture'?110: 114,
        y: diploma==='Architecture'?154: 153.5,
        size: 14,
        font: timesNewRomanBoldFont,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(lieu, {
        x: diploma==='Architecture'?207:211,
        y: diploma==='Architecture'? 154.5:154,
        size: 14,
        font: timesNewRomanBoldFont,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(id, {
        x: diploma==='Architecture'?225:226,
        y: diploma==='Architecture'?130.5: 130,
        size: 14,
        font: timesNewRomanBoldFont,
        color: rgb(0, 0, 0),
      });
      if (diploma === 'Bachelors')
      firstPage.drawText(mention, {
        x: 714,
        y: 212,
        size: 14,
        font: timesNewRomanBoldFont,
        color: rgb(0, 0, 0),
      });

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);

      setPdfURL(blobUrl);
      setPdfBytes(modifiedPdfBytes);
    } catch (error) {
      console.error("Error loading PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF."); // User feedback
    } finally {
      setLoading(false); // Reset loading state
    }
  }

  return (
    <div>
      <button type="button" onClick={modifyPdf} disabled={loading} aria-label="Visualiser le diplôme" className="generate-button">
        {loading ? "Génération en cours..." : "Visualiser Diplôme"}
      </button>
      {pdfURL && <iframe src={pdfURL} width="100%" height="500px" title="Generated PDF" />}
    </div>
  );
}

export default PdfHendling;