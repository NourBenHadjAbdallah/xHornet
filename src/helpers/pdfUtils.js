import { PDFDocument, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export const modifyPdfTemplate = async ({
  pdfUrl,
  qrImageBase64,
  formData,
  diplomaType,
  specialtyName = '',
  academicFullYear,
  formatDateFunctions = {},
}) => {
  const { 
    fullName, 
    birthDate, 
    birthPlace, 
    id, 
    procesVerbal, 
    mention = '', 
    soutenancePV = '', 
    currentDate 
  } = formData;

  const { formatProcesVerbal, formatCurrentDate, formatBirthDate, formatDateForSoutenancePV } = formatDateFunctions;

  try {
    const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);

    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    const firstPage = pdfDoc.getPages()[0];
    const pngImage = await pdfDoc.embedPng(`data:image/png;base64,${qrImageBase64}`);
    firstPage.drawImage(pngImage, {
      x: 366,
      y: 26,
      width: pngImage.width / 1.4,
      height: pngImage.height / 1.4,
    });

    const form = pdfDoc.getForm();

    // Common fields
    form.getTextField("QRText").setText("Application Mobile:QrCheckMobile");
    form.getTextField("FullYear").setText(academicFullYear);
    form.getTextField("ProcesVerbal").setText(formatProcesVerbal ? formatProcesVerbal(procesVerbal) : procesVerbal);
    form.getTextField("FullName").setText(fullName);
    form.getTextField("Birth").setText(formatBirthDate ? formatBirthDate(birthDate) : birthDate);
    form.getTextField("Lieu").setText(birthPlace);
    form.getTextField("ID").setText(id);
    form.getTextField("datePermutation").setText(formatCurrentDate ? formatCurrentDate(currentDate) : currentDate);

    // Update appearances
    form.getTextField("QRText").updateAppearances(timesRomanBoldFont);
    form.getTextField("FullYear").updateAppearances(timesRomanBoldFont);
    form.getTextField("ProcesVerbal").updateAppearances(timesRomanBoldFont);
    form.getTextField("FullName").updateAppearances(timesRomanBoldFont);
    form.getTextField("Birth").updateAppearances(timesRomanBoldFont);
    form.getTextField("Lieu").updateAppearances(timesRomanBoldFont);
    form.getTextField("ID").updateAppearances(timesRomanBoldFont);
    form.getTextField("datePermutation").updateAppearances(timesRomanFont);

    // Diploma-specific fields
    if (diplomaType === 'Licence' && mention) {
      const mentionField = form.getTextField("Mention");
      mentionField.setText(mention);
      mentionField.updateAppearances(timesRomanBoldFont);
    }
    if (diplomaType === 'Architecture' || diplomaType === '2') {
      const soutenancePVField = form.getTextField("SoutenancePV");
      soutenancePVField.setText(formatDateForSoutenancePV ? formatDateForSoutenancePV(soutenancePV) : soutenancePV);
      soutenancePVField.updateAppearances(timesRomanBoldFont);
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error("Error modifying PDF:", error);
    throw error;
  }
};