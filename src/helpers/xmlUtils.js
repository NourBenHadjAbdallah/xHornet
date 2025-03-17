// xmlUtils.js
import { api } from '../api'; // Adjust path as per your project structure
import configData from "../helpers/config.json";
import { xmlFake } from "../helpers/utils.js";
var XMLParser = require('react-xml-parser');

export const generateQrXml = ({
  diplomaType,
  fullName,
  id,
  specialty,
  birthDate,
  academicFullYear,
  dateProces,
  mention = '',
  soutenancePV = '',
}) => {
  let xmlsFR;

  switch (diplomaType) {
    case "Licence":
      xmlsFR = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.soap.progress.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:signatureWs>
      <participant>${configData.QR.PARTICIPANT}</participant>
      <codePin>${configData.QR.PIN}</codePin>
      <alias>${configData.QR.ALIAS}</alias>
      <sessionId></sessionId>
      <typeDoc>${configData.QR.DOC_TYPE_FR}</typeDoc>
      <values>
        <item><code>C2</code><value>${fullName}</value></item>
        <item><code>H8</code><value>${id}</value></item>
        <item><code>15</code><value>Diplôme national de licence</value></item>
        <item><code>PN</code><value>${birthDate}</value></item>
        <item><code>18</code><value>${specialty}</value></item>
        <item><code>ZX</code><value>${academicFullYear}</value></item>
        <item><code>E6</code><value>${dateProces}</value></item>
        ${mention ? `<item><code>19</code><value>${mention}</value></item>` : ''}
      </values>
    </ws:signatureWs>
  </soapenv:Body>
</soapenv:Envelope>`;
      break;

    case "Ingénieur":
      xmlsFR = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.soap.progress.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:signatureWs>
      <participant>${configData.QR.PARTICIPANT}</participant>
      <codePin>${configData.QR.PIN}</codePin>
      <alias>${configData.QR.ALIAS}</alias>
      <sessionId></sessionId>
      <typeDoc>${configData.QR.DOC_TYPE_FR}</typeDoc>
      <values>
        <item><code>00</code><value>${fullName}</value></item>
        <item><code>0K</code><value>${id}</value></item>
        <item><code>CB</code><value>Diplôme national d'ingénieur</value></item>
        <item><code>CC</code><value>${birthDate}</value></item>
        <item><code>CE</code><value>${academicFullYear}</value></item>
        <item><code>CF</code><value>${dateProces}</value></item>
        <item><code>CI</code><value>${configData.DIRECTEUR}</value></item>
      </values>
    </ws:signatureWs>
  </soapenv:Body>
</soapenv:Envelope>`;
      break;

    case "Architecture":
      xmlsFR = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.soap.progress.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:signatureWs>
      <participant>${configData.QR.PARTICIPANT}</participant>
      <codePin>${configData.QR.PIN}</codePin>
      <alias>${configData.QR.ALIAS}</alias>
      <sessionId></sessionId>
      <typeDoc>${configData.QR.DOC_TYPE_FR}</typeDoc>
      <values>
        <item><code>C2</code><value>${fullName}</value></item>
        <item><code>H8</code><value>${id}</value></item>
        <item><code>15</code><value>Diplôme national d'architecture</value></item>
        <item><code>PN</code><value>${birthDate}</value></item>
        <item><code>ZX</code><value>${academicFullYear}</value></item>
        <item><code>E6</code><value>${dateProces}</value></item>
        <item><code>EQ</code><value>${soutenancePV}</value></item>
      </values>
    </ws:signatureWs>
  </soapenv:Body>
</soapenv:Envelope>`;
      break;

    default:
      throw new Error("Diploma type not found");
  }

  return xmlsFR;
};

export const processQrRequest = async (xmls, callbacks = {}) => {
  const { onSuccess, onError, onQrImage } = callbacks;

  try {
    const res = await api.post('', xmls);
    if (!res || !res.data) throw new Error("API response invalid");

    const xmol = new XMLParser().parseFromString(configData.MODE === 1 ? res.data : xmlFake);
    const image = xmol.getElementsByTagName('imageCev')[0]?.value || '';
    const message = xmol.getElementsByTagName('message')[0]?.value || '';

    if (message !== 'Success') {
      throw new Error(message);
    }

    if (onQrImage) onQrImage(image);
    if (onSuccess) onSuccess();
    return image;
  } catch (err) {
    console.error("API Error:", err);
    if (onError) onError(err.message || "Erreur lors de la connexion au serveur Tuntrust. Veuillez réessayer.");
    throw err;
  }
};