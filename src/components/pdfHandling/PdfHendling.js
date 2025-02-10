import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import configData from "../../helpers/config.json";
import fontkit from "@pdf-lib/fontkit";


function PdfHendling({ checkedDuplicata, diploma, formData }) {
  const [pdfBytes, setPdfBytes] = useState(null);
  const [pdfURL, setPdfURL] = useState(null);

  // Get the correct diploma file name
  const getDiploma = () => {
    let diplomaCategory = null;

    if (configData.DIPLOMAS.Bachelors[diploma]) {
      diplomaCategory = configData.DIPLOMAS.Bachelors;
    } else if (configData.DIPLOMAS.Engineering[diploma]) {
      diplomaCategory = configData.DIPLOMAS.Engineering;
    } else if (configData.DIPLOMAS.Architecture[diploma]) {
      diplomaCategory = configData.DIPLOMAS.Architecture;
    }

    if (diplomaCategory) {
      return checkedDuplicata
        ? diplomaCategory.duplicata[diploma] + ".pdf"
        : diplomaCategory.normal[diploma] + ".pdf";
    }

    return null;
  };

  async function modifyPdf() {
    const diplomeName = getDiploma();
    if (!diplomeName) {
      alert("Diplôme introuvable !");
      return;
    }

    const url = `../../assets/${diplomeName}`;
    try {
      const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Modify PDF here if needed...
    pdfDoc.registerFontkit(fontkit);
    // Embed times new roman font
    const timesNewRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    // Embed times new roman bold font
    const timesNewRomanBoldFont = await pdfDoc.embedFont(
      StandardFonts.TimesRomanBold
    );
    // Get the first page of the document
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const base64Image = imageQR64;
    var base64Icon = `data:image/png;base64,${base64Image}`;
    const pngImage = await pdfDoc.embedPng(base64Icon);
    firstPage.drawImage(pngImage, {
      x: 366,
      y:  26,
      width: pngImage.width  / 1.4,
      height: pngImage.height  / 1.4,
    });
    firstPage.drawText("Application Mobile:QrCheckMobile", {
      x: 359,
      y:  30,
      size: 8,
      font: timesNewRomanFont,
      color: rgb(0, 0, 0),
    });
    //FR
    firstPage.drawText(`${LastYear}-${Year}`, {
      x: 371,
      y: 375.5,
      size: 9,
      font: timesNewRomanFont,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(procesVerbal, {
      x: 547,
      y: 375.5,
      size: 9,
      font: timesNewRomanFont,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(lastName + " " + firstName, {
      x: 110,
      y: 178,
      size: 14,
      font: timesNewRomanBoldFont,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(birthEtudiantFR, {
      x: 114,
      y: 153.5,
      size: 14,
      font: timesNewRomanBoldFont,
      color: rgb(0, 0, 0),
    });
    ///FR
    firstPage.drawText(lieu, {
      x: 211,
      y: 154,
      size: 14,
      font: timesNewRomanBoldFont,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(id, {
      x: 226,
      y: 130,
      size: 14,
      font: timesNewRomanBoldFont,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(datePermutation, {
      x: 667,
      y: 130.7,
      size: 14,
      font: timesNewRomanFont,
      color: rgb(0, 0, 0),
    });
firstPage.drawText(conversionMentionFrench(mention), {
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
    }
  }

  return (
    <div>
      <button
        className={pdfBytes ? "generate-button-disabled" : "generate-button"}
        disabled={!!pdfBytes}
        type="button"
        onClick={() => modifyPdf()}
      >
        Visualiser Diplôme
      </button>

    </div>
  );
}

export default PdfHendling;
