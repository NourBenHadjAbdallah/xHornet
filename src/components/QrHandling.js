import React, { useState } from 'react'
import configData from "../helpers/config.json"
import { api } from "../api";
import { xmlFake } from "../helpers/utils.js";
import XMLParser from 'react-xml-parser';
const ipc = window.require("electron").ipcRenderer;

function QrHandling({firstName,lastName,id,Year,soutenancePV,date,dateProces,LastYear,mention,academicFullYear,Diploma,naissance,speciality,duplicate}) {
   const [enabled] = useState();
   const [imageQR64, setImageQR64] = useState("");
   const [enabledhide, setEnabledhide] = useState(false);
   let xmlsFR,xmlsEN;
   const callback = (
    id,
    firstName,
    lastName,
    speciality,   
    mention,
    naissance,
    Diploma,
    academicFullYear
  )
  async function createFolder() {
    ipc.send("createFolder", id, speciality, Diploma, academicFullYear,false);
   
  }
  async function writeLog() {
    ipc.send("logFile", id, Diploma, academicFullYear,duplicate);
  }
   
    const conversionMentionEnglish = (mention) => {
        let mentions = {
            "passable": "with standard pass",
            "assez bien": "with honours",
            "bien": "with high honours",
            "trés bien": "with highest honour"
        };
        return mentions[mention] || "Unknown Mention";
    };
    function getspecialtyeEN(speciality) {
      var inputMap = {
         // Engineering specialties
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
    
      return inputMap[speciality] ;
    }
   const mentionEn = conversionMentionEnglish(mention)
   const specialtyEN = getspecialtyeEN(speciality)


   const xmls =(Diploma) => {
      switch (Diploma){
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
                     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.soap.progress.com/">
                        <soapenv:Header/>
                        <soapenv:Body>
                           <ws:signatureWs>
                                 <participant>${configData.QR.PARTICIPANT}</participant>
                                 <codePin>${configData.QR.PIN}</codePin>
                                 <alias>${configData.QR.ALIAS}</alias>
                                 <sessionId></sessionId>
                                 <typeDoc>${configData.QR.DOC_TYPE_EN}</typeDoc>
                                 <values>
                                    <!--Zero or more repetitions:-->
                                    <item>
                                       <!--Optional:-->
                                       <code>CJ</code>
                                       <!--Optional:-->
                                       <value>${lastName} ${firstName}</value>
                                    </item>
                                    <item>
                                       <!--Optional:-->
                                       <code>0K</code>
                                       <!--Optional:-->
                                       <value>${id}</value>
                                    </item>
                                    <item>
                                       <!--Optional:-->
                                       <code>CK</code>
                                       <!--Optional:-->
                                       <value>National Bachelor Degree</value>
                                    </item>
                                    <item>
                                       <!--Optional:-->
                                       <code>CC</code>
                                       <!--Optional:-->
                                       <value>${date}</value>
                                    </item>
                                    <item>
                                       <!--Optional:-->
                                       <code>AN</code>
                                       <!--Optional:-->
                                       <value>${specialtyEN}</value>
                                    </item>
                                    <item>
                                       <!--Optional:-->
                                       <code>CM</code>
                                       <!--Optional:-->
                                       <value>${LastYear}-${Year}</value>
                                    </item>
                                    <item>
                                       <!--Optional:-->
                                       <code>CN</code>
                                       <!--Optional:-->
                                       <value>${dateProces}</value>
                                    </item>
                                    <item>
                                       <!--Optional:-->
                                       <code>CD</code>
                                       <!--Optional:-->
                                       <value>${mentionEn}</value>
                                    </item>
                                 </values>
                           </ws:signatureWs>
                        </soapenv:Body>
                     </soapenv:Envelope>`;
            break;
         case "Engineering":
            xmlsFR = `<?xml version="1.0" encoding="UTF-8"?>
                     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
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
                                    <!-- Zero or more repetitions -->
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
            xmlsEN =`<?xml version="1.0" encoding="UTF-8"?>
                     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.soap.progress.com/">
                        <soapenv:Header/>
                        <soapenv:Body>
                           <ws:signatureWs>
                                 <participant>${configData.QR.PARTICIPANT}</participant>
                                 <codePin>${configData.QR.PIN}</codePin>
                                 <alias>${configData.QR.ALIAS}</alias>
                                 <sessionId></sessionId>
                                 <typeDoc>${configData.QR.DOC_TYPE_EN}</typeDoc>
                                 <values>
                                    <!-- Zero or more repetitions: -->
                                    <item>
                                       <!-- Optional: -->
                                       <code>CJ</code>
                                       <!-- Optional: -->
                                       <value>${lastName} ${firstName}</value>
                                    </item>
                                    <item>
                                       <!-- Optional: -->
                                       <code>0K</code>
                                       <!-- Optional: -->
                                       <value>${id}</value>
                                    </item>
                                    <item>
                                       <!-- Optional: -->
                                       <code>CK</code>
                                       <!-- Optional: -->
                                       <value>National Engineering diploma</value>
                                    </item>
                                    <item>
                                       <!-- Optional: -->
                                       <code>CC</code>
                                       <!-- Optional: -->
                                       <value>${date}</value>
                                    </item>
                                    <item>
                                       <!-- Optional: -->
                                       <code>AN</code>
                                       <!-- Optional: -->
                                       <value>${specialtyEN}</value>
                                    </item>
                                    <item>
                                       <!-- Optional: -->
                                       <code>CM</code>
                                       <!-- Optional: -->
                                       <value>${LastYear}-${Year}</value>
                                    </item>
                                    <item>
                                       <!-- Optional: -->
                                       <code>CN</code>
                                       <!-- Optional: -->
                                       <value>${dateProces}</value>
                                    </item>
                                 </values>
                           </ws:signatureWs>
                        </soapenv:Body>
                     </soapenv:Envelope>`;

            break;
         case "Architecture":
            xmlsFR = `<?xml version="1.0" encoding="UTF-8"?>
                     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
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
                                 <!-- Zero or more repetitions -->
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
                     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.soap.progress.com/">
                        <soapenv:Header/>
                        <soapenv:Body>
                           <ws:signatureWs>
                                 <participant>${configData.QR.PARTICIPANT}</participant>
                                 <codePin>${configData.QR.PIN}</codePin>
                                 <alias>${configData.QR.ALIAS}</alias>
                                 <sessionId></sessionId>
                                 <typeDoc>${configData.QR.DOC_TYPE_EN}</typeDoc>
                                 <values>
                                    <!-- Zero or more repetitions: -->
                                    <item>
                                       <!-- Optional: -->
                                       <code>CJ</code>
                                       <!-- Optional: -->
                                       <value>${lastName} ${firstName}</value>
                                    </item>
                                    <item>
                                       <!-- Optional: -->
                                       <code>0K</code>
                                       <!-- Optional: -->
                                       <value>${id}</value>
                                    </item>
                                    <item>
                                       <!-- Optional: -->
                                       <code>CK</code>
                                       <!-- Optional: -->
                                       <value>National diploma of architect</value>
                                    </item>
                                    <item>
                                       <!-- Optional: -->
                                       <code>CC</code>
                                       <!-- Optional: -->
                                       <value>${date}</value>
                                    </item>
                                    <item>
                                       <!-- Optional: -->
                                       <code>CL</code>
                                       <!-- Optional: -->
                                       <value>${soutenancePV}</value>
                                    </item>
                                    <item>
                                       <!-- Optional: -->
                                       <code>CM</code>
                                       <!-- Optional: -->
                                       <value>${LastYear}-${Year}</value>
                                    </item>
                                    <item>
                                       <!-- Optional: -->
                                       <code>CN</code>
                                       <!-- Optional: -->
                                       <value>${dateProces}</value>
                                    </item>
                                 </values>
                           </ws:signatureWs>
                        </soapenv:Body>
                     </soapenv:Envelope>`;
            break;
         default:
            console.log("not found");
      }
      api
      //.post("", configData.LANG === 1 ?xmlsEN:xmlsFR)
      .post("", xmls)
      .then((res) => {
        setEnabledhide(true);
        var xmol = new XMLParser().parseFromString(
          configData.MODE === 1 ? res.data : xmlFake
        );
        xmol.getElementsByTagName("imageCev").map((item, i) => {
          callback(
            item.value,
            false,
            id,
            firstName,
            lastName,
            speciality,
            mention,
            naissance,
            Diploma,
            academicFullYear
          );
          setImageQR64(item.value);
          return null;
        });
        xmol.getElementsByTagName("message").map((item, i) => {
          return item.value !== "Success" ? alert(item.value) : createFolder()&writeLog();
        });
      })
      .catch((err) => {
        console.log(err);
        alert('Erreur lors de connexion au serveur Tuntrust, Veuillez réessayer')
      });
      
   };

      
  return (
   <button                 
   className={enabled ? "cancel-button-disabled" : "cancel-button"}
   type="button"
   onClick={() => {
     QrHandling();
   }}
   disabled={enabled}>
    Générer QR
  </button>
  )
}

export default QrHandling