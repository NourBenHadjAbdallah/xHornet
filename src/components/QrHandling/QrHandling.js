import React, { useState } from 'react';
import "../QrHandling/QrButtonStyle.css";
import configData from '../../helpers/config.json';
import { api } from "../../api";
import { xmlFake } from "../../helpers/utils.js";
const ipc = window.require("electron").ipcRenderer;
var XMLParser = require("react-xml-parser");



function QrHandling({formData,parentcallback,setEnabledhide, enabled, callback }) {
  const {
    diploma,
    selectedSpecialty,
    lastName,
    firstName,
    mention,
    id,
    date,
    LastYear,
    Year,
    dateProces,
    soutenancePV,
    checkedDuplicata,
    academicFullYear,
  } = formData;
    const [imageQR64, setImageQR64] = useState("");



  async function createFolder() {
    ipc.send("createFolder", id, selectedSpecialty, diploma, academicFullYear,false);
   
  }

  async function writeLog() {
    ipc.send("logFile", id, diploma, academicFullYear, checkedDuplicata);
  }

  console.log("Received form data:", formData);
  const generateData = () => {
    let xmlsFR;
    switch (diploma){
      case "Bachelors":
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
             <!--Zero or more repetitions:-->
             <item>
                <!--Optional:-->
                <code>C2</code>
                <!--Optional:-->
                <value>${lastName} ${firstName}</value>
             </item>
               <item>
                <!--Optional:-->
                <code>H8</code>
                <!--Optional:-->
                <value>${id}</value>
             </item>
             <item>
                <!--Optional:-->
                <code>15</code>
                <!--Optional:-->
                <value>Diplôme national de licence</value>
             </item>
                <item>
                <!--Optional:-->
                <code>PN</code>
                <!--Optional:-->
                <value>${date}</value>
             </item>
             <item>
                <!--Optional:-->
                <code>18</code>
                <!--Optional:-->
                <value>${selectedSpecialty}</value>
             </item>
             <item>
             <!--Optional:-->
             <code>ZX</code>
             <!--Optional:-->
             <value>${LastYear}-${Year}</value>
          </item>
          <item>
          <!--Optional:-->
          <code>E6</code>
          <!--Optional:-->
          <value>${dateProces}</value>
       </item>
       <item>
                <!--Optional:-->
                <code>19</code>
                <!--Optional:-->
                <value>Bien</value>
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
break;

default:
  console.log("Diploma type not found");
  break;

    }
    // Send XML payload to the API
    api
      .post("", xmlsFR)
      .then((res) => {
        setEnabledhide(true); // Hide UI elements if needed
        var xmol = new XMLParser().parseFromString(
          configData.MODE === 1 ? res.data : xmlFake
        );

        // Extract QR code image from the response
        xmol.getElementsByTagName("imageCev").forEach((item) => {
          // Set QR code image in state
          if (parentcallback) {
            parentcallback(
              item.value,
              false,
              id,
              firstName,
              lastName,
              selectedSpecialty,
              mention,
              date,
              diploma,
              academicFullYear
            );
            callback(item.value)
          }
        });

        // Handle API response messages
        xmol.getElementsByTagName("message").forEach((item) => {
          if (item.value !== "Success") {
            alert(item.value); // Show error message
          } else {
            createFolder(); // Create folder
            writeLog(); // Write logs
          }
        });
      })
      .catch((err) => {
        console.error("API Error:", err);
        alert("Erreur lors de la connexion au serveur Tuntrust. Veuillez réessayer.");
      });
  };


  return (
    <button
      className={enabled ? "cancel-button-disabled" : "cancel-button"} 
      
      type="button"
      onClick={() => {
        generateData();
      }}
    >
    Générer QR
    </button>
  )
}

export default QrHandling