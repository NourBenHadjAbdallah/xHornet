const configData = require("./config.json");

exports.prepareEmailContent = ({
  recipientEmail,
  fullName,
  diplomaType,
  academicFullYear,
  diplomaLink,
}) => {
  const institutionName = configData.ETABLISSEMENT.FR;

  const subject = `Your ${diplomaType} Diploma - ${academicFullYear}`;
  const html = `
    <p>Dear ${fullName},</p>
    <p>Please find attached your official ${diplomaType} diploma for the academic year ${academicFullYear}.</p>
    <p>You can view and verify your diploma by clicking on the link below:</p>
    <p><a href="${diplomaLink}">${diplomaLink}</a></p>
    <p>Best regards,</p>
    <p>${institutionName}</p>
  `;



  return {
    recipientEmail,
    subject,
    html,
  };
};