import React, { useState } from 'react';
import configData from "../helpers/config.json";
import { api } from "../api";
import { xmlFake } from "../helpers/utils.js";
import XMLParser from 'react-xml-parser';
const ipc = window.require("electron").ipcRenderer;

function QrHandling({
  firstName,
  lastName,
  id,
  Year,
  soutenancePV,
  date,
  dateProces,
  LastYear,
  mention,
  academicFullYear,
  Diploma,
  naissance,
  speciality,
  duplicate,
  onQRGenerated, // optional callback passed as a prop if needed
}) {
  // You can use this state to disable the button or show a loading spinner.
  const [loading, setLoading] = useState(false);
  const [imageQR64, setImageQR64] = useState("");
  const [enabledhide, setEnabledhide] = useState(false);

  // Helper function to convert the mention (if needed)
  const conversionMentionEnglish = (ment) => {
    const mentions = {
      "passable": "with standard pass",
      "assez bien": "with honours",
      "bien": "with high honours",
      "trés bien": "with highest honour"
    };
    return mentions[ment.toLowerCase()] || "Unknown Mention";
  };

  // Example: convert speciality for the English version.
  const getspecialtyeEN = (spec) => {
    const inputMap = {
      "Génie Informatique": "Computer Engineering",
      "Génie Informatique de Gestion": "Management Information Systems Engineering",
      "Génie Télécommunications & Réseaux": "Telecommunications & Networks Engineering",
      "Génie Electrique et Automatique": "Electrical and Automation Engineering",
      "Génie Electromécanique": "Electromechanical Engineering",
      "Génie Mécanique": "Mechanical Engineering",
      "Génie Biotechnologique": "Biotechnological Engineering",
      "Génie Civil": "Civil Engineering",
      // Bachelors specialties
      "Business Intelligence": "Business Intelligence",
      "Information Systems and Software Engineering": "Information Systems and Software Engineering",
    };
    return inputMap[spec] || spec;
  };

  // Prepare values for the English version
  const mentionEn = conversionMentionEnglish(mention);
  const specialtyEN = getspecialtyeEN(speciality);

  // Generate the XML payload based on Diploma type
  const generateXML = (diploma) => {
    let xmlsFR = "";
    let xmlsEN = "";
    switch (diploma) {
      case "Bachelors":
        xmlsFR = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope 
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
  xmlns:ws="http://ws.soap.progress.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:signatureWs>
      <participant>${configData.QR.PARTICIPANT}</participant>
      <codePin>${configData.QR.PIN}</codePin>
      <alias>${configData.QR.ALIAS}</alias>
      <sessionId></sessionId>
      <typeDoc>${configData.QR.DOC_TYPE_FR}</typeDoc>
      <values>
        <item>
          <code>C2</code>
          <value>${lastName} ${firstName}</value>
        </item>
        <item>
          <code>H8</code>
          <value>${id}</value>
        </item>
        <item>
          <code>15</code>
          <value>Diplôme national de licence</value>
        </item>
        <item>
          <code>PN</code>
          <value>${date}</value>
        </item>
        <item>
          <code>18</code>
          <value>Business Intelligence</value>
        </item>
        <item>
          <code>ZX</code>
          <value>${LastYear}-${Year}</value>
        </item>
        <item>
          <code>E6</code>
          <value>${dateProces}</value>
        </item>
        <item>
          <code>19</code>
          <value>${mention}</value>
        </item>
      </values>
    </ws:signatureWs>
  </soapenv:Body>
</soapenv:Envelope>`;

        xmlsEN = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope 
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
  xmlns:ws="http://ws.soap.progress.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:signatureWs>
      <participant>${configData.QR.PARTICIPANT}</participant>
      <codePin>${configData.QR.PIN}</codePin>
      <alias>${configData.QR.ALIAS}</alias>
      <sessionId></sessionId>
      <typeDoc>${configData.QR.DOC_TYPE_EN}</typeDoc>
      <values>
        <item>
          <code>CJ</code>
          <value>${lastName} ${firstName}</value>
        </item>
        <item>
          <code>0K</code>
          <value>${id}</value>
        </item>
        <item>
          <code>CK</code>
          <value>National Bachelor Degree</value>
        </item>
        <item>
          <code>CC</code>
          <value>${date}</value>
        </item>
        <item>
          <code>AN</code>
          <value>${specialtyEN}</value>
        </item>
        <item>
          <code>CM</code>
          <value>${LastYear}-${Year}</value>
        </item>
        <item>
          <code>CN</code>
          <value>${dateProces}</value>
        </item>
        <item>
          <code>CD</code>
          <value>${mentionEn}</value>
        </item>
      </values>
    </ws:signatureWs>
  </soapenv:Body>
</soapenv:Envelope>`;
        break;

      case "Engineering":
        xmlsFR = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope 
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:ws="http://ws.soap.progress.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:signatureWs>
      <participant>${configData.QR.PARTICIPANT}</participant>
      <codePin>${configData.QR.PIN}</codePin>
      <alias>${configData.QR.ALIAS}</alias>
      <sessionId></sessionId>
      <typeDoc>${configData.QR.DOC_TYPE_FR}</typeDoc>
      <values>
        <item>
          <code>00</code>
          <value>${lastName} ${firstName}</value>
        </item>
        <item>
          <code>0K</code>
          <value>${id}</value>
        </item>
        <item>
          <code>CB</code>
          <value>Diplôme national d'ingénieur</value>
        </item>
        <item>
          <code>CC</code>
          <value>${date}</value>
        </item>
        <item>
          <code>CE</code>
          <value>${LastYear}/${Year}</value>
        </item>
        <item>
          <code>CF</code>
          <value>${dateProces}</value>
        </item>
        <item>
          <code>CI</code>
          <value>${configData.DIRECTEUR}</value>
        </item>
      </values>
    </ws:signatureWs>
  </soapenv:Body>
</soapenv:Envelope>`;

        xmlsEN = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope 
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
  xmlns:ws="http://ws.soap.progress.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:signatureWs>
      <participant>${configData.QR.PARTICIPANT}</participant>
      <codePin>${configData.QR.PIN}</codePin>
      <alias>${configData.QR.ALIAS}</alias>
      <sessionId></sessionId>
      <typeDoc>${configData.QR.DOC_TYPE_EN}</typeDoc>
      <values>
        <item>
          <code>CJ</code>
          <value>${lastName} ${firstName}</value>
        </item>
        <item>
          <code>0K</code>
          <value>${id}</value>
        </item>
        <item>
          <code>CK</code>
          <value>National Engineering diploma</value>
        </item>
        <item>
          <code>CC</code>
          <value>${date}</value>
        </item>
        <item>
          <code>AN</code>
          <value>${specialtyEN}</value>
        </item>
        <item>
          <code>CM</code>
          <value>${LastYear}-${Year}</value>
        </item>
        <item>
          <code>CN</code>
          <value>${dateProces}</value>
        </item>
      </values>
    </ws:signatureWs>
  </soapenv:Body>
</soapenv:Envelope>`;
        break;

      case "Architecture":
        xmlsFR = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope 
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
  xmlns:ws="http://ws.soap.progress.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:signatureWs>
      <participant>${configData.QR.PARTICIPANT}</participant>
      <codePin>${configData.QR.PIN}</codePin>
      <alias>${configData.QR.ALIAS}</alias>
      <sessionId></sessionId>
      <typeDoc>${configData.QR.DOC_TYPE_FR}</typeDoc>
      <values>
        <item>
          <code>C2</code>
          <value>${lastName} ${firstName}</value>
        </item>
        <item>
          <code>H8</code>
          <value>${id}</value>
        </item>
        <item>
          <code>15</code>
          <value>Diplôme national d'architecture</value>
        </item>
        <item>
          <code>PN</code>
          <value>${date}</value>
        </item>
        <item>
          <code>ZX</code>
          <value>${LastYear}/${Year}</value>
        </item>
        <item>
          <code>E6</code>
          <value>${dateProces}</value>
        </item>
        <item>
          <code>EQ</code>
          <value>${soutenancePV}</value>
        </item>
      </values>
    </ws:signatureWs>
  </soapenv:Body>
</soapenv:Envelope>`;

        xmlsEN = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope 
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
  xmlns:ws="http://ws.soap.progress.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:signatureWs>
      <participant>${configData.QR.PARTICIPANT}</participant>
      <codePin>${configData.QR.PIN}</codePin>
      <alias>${configData.QR.ALIAS}</alias>
      <sessionId></sessionId>
      <typeDoc>${configData.QR.DOC_TYPE_EN}</typeDoc>
      <values>
        <item>
          <code>CJ</code>
          <value>${lastName} ${firstName}</value>
        </item>
        <item>
          <code>0K</code>
          <value>${id}</value>
        </item>
        <item>
          <code>CK</code>
          <value>National diploma of architect</value>
        </item>
        <item>
          <code>CC</code>
          <value>${date}</value>
        </item>
        <item>
          <code>CL</code>
          <value>${soutenancePV}</value>
        </item>
        <item>
          <code>CM</code>
          <value>${LastYear}-${Year}</value>
        </item>
        <item>
          <code>CN</code>
          <value>${dateProces}</value>
        </item>
      </values>
    </ws:signatureWs>
  </soapenv:Body>
</soapenv:Envelope>`;
        break;

      default:
        console.log("Diploma type not found");
        break;
    }
    // Return the XML payload based on a language flag (here we use FR for example)
    return configData.LANG === 1 ? xmlsEN : xmlsFR;
  };

  // Function to send IPC messages for folder creation and logging
  const createFolder = () => {
    ipc.send("createFolder", id, speciality, Diploma, academicFullYear, false);
  };

  const writeLog = () => {
    ipc.send("logFile", id, Diploma, academicFullYear, duplicate);
  };

  // Handler to generate the QR code
  const handleGenerateQR = () => {
    setLoading(true);
    const xmlPayload = generateXML(Diploma);
    api
      // Uncomment the following line if you want to use the language flag:
      // .post("", configData.LANG === 1 ? xmlsEN : xmlsFR)
      .post("", xmlPayload)
      .then((res) => {
        setEnabledhide(true);
        const responseXML =
          configData.MODE === 1 ? res.data : xmlFake;
        const parsedXML = new XMLParser().parseFromString(responseXML);

        // Look for the QR code base64 string
        const imageElements = parsedXML.getElementsByTagName("imageCev");
        if (imageElements && imageElements.length > 0) {
          const qrValue = imageElements[0].value;
          setImageQR64(qrValue);
          // Call the callback function if provided
          if (onQRGenerated) {
            onQRGenerated(qrValue);
          }
        }

        // Look for messages
        const messages = parsedXML.getElementsByTagName("message");
        messages.forEach((item) => {
          if (item.value !== "Success") {
            alert(item.value);
          } else {
            createFolder();
            writeLog();
          }
        });
      })
      .catch((err) => {
        console.error(err);
        alert('Erreur lors de connexion au serveur Tuntrust, Veuillez réessayer');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <button
      className={loading ? "cancel-button-disabled" : "cancel-button"}
      type="button"
      onClick={handleGenerateQR}
      disabled={loading}
    >
      Générer QR
    </button>
  );
}

export default QrHandling;
