const configData = require("./config.json");

exports.prepareEmailContent = ({
  recipientEmail,
  fullName,
  diplomaType,
  academicFullYear,
  pdfBase64,
  jsonBase64,
  diplomaLink, // Added
}) => {
  const institutionName = configData.ETABLISSEMENT.FR;

  const subject = `Your ${diplomaType} Diploma and Proof of Authenticity - ${academicFullYear}`;
  const html = `
    <p>Dear ${fullName},</p>
    <p>Please find attached your official ${diplomaType} diploma for the academic year ${academicFullYear}, along with a JSON file containing the proof of authenticity for your diploma's entry on the blockchain.</p>
    <p>You can use the information in the JSON file to verify the authenticity of your diploma on our blockchain verification portal.</p>
    <p>You can view and verify your diploma by clicking on the link below:</p>
    <p><a href="${diplomaLink}">${diplomaLink}</a></p>
    <p>Best regards,</p>
    <p>${institutionName}</p>
  `;

  const attachments = [
    {
      filename: `${fullName.replace(/\s/g, '_')}_${diplomaType}_Diploma_${academicFullYear}.pdf`,
      content: pdfBase64,
      encoding: 'base64',
      contentType: 'application/pdf',
    },
    {
      filename: `${fullName.replace(/\s/g, '_')}_${diplomaType}_Proof_${academicFullYear}.json`,
      content: jsonBase64,
      encoding: 'base64',
      contentType: 'application/json',
    },
  ];

  return {
    recipientEmail,
    subject,
    html,
    attachments,
  };
};