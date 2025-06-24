const nodemailer = require('nodemailer');
const { prepareEmailContent } = require('../helpers/emailutils');

const transporter = nodemailer.createTransport({
    host: 'smtp.ionos.fr',
    port: 465,
    secure: true,
    auth: {
        user: 'centre-op-robots1@audassia.com',
        pass: 'centre-op-robots1:190365&',
    },
});

exports.sendEmail = async ({
  recipientEmail,
  fullName,
  diplomaType,
  academicFullYear,
  pdfBase64,
  jsonBase64,
  diplomaLink, // Added
}) => {
  try {
    const { subject, html, attachments } = prepareEmailContent({
      recipientEmail,
      fullName,
      diplomaType,
      academicFullYear,
      pdfBase64,
      jsonBase64,
      diplomaLink, // Passed
    });

    const mailOptions = {
      from: 'centre-op-robots1@audassia.com',
      to: recipientEmail,
      subject: subject,
      html: html,
      attachments: attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
    return { success: false, error: error.message };
  }
};