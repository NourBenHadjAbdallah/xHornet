import React from "react";
import { generateQrXml, processQrRequest } from "../../helpers/xmlUtils.js";
import { connectToContract, issueDiploma } from "../../helpers/contract.js";
import { generateDiplomaHash } from "../../helpers/hashUtils.js"; 
const ipc = window.require ? window.require("electron").ipcRenderer : null;
const PRIVATE_KEY = "79fe3fa380c3b5e244c5cba7a6ef0f503f9adf9e486b562eb804ddc761a16c7d";


function QrHandling({ 
  formData, 
  parentcallback, 
  setEnabledhide, 
  isDisabled, 
  setQrHandlingInitiated, 
  callback, 
  onHashGenerated 
}) {
  const {
    Diploma,
    specialty,
    lastName,
    firstName,
    mention,
    id,
    naissance,
    dateProces,
    soutenancePV,
    checkedDuplicata, 
    academicFullYear,
  } = formData;


  async function createFolder() { if (ipc) ipc.send("createFolder", id, specialty, Diploma, academicFullYear, false); }
  async function writeLog() { if (ipc) ipc.send("logFile", id, Diploma, academicFullYear, checkedDuplicata); }
  
  const storeDiplomaToBlockchain = async () => {
    try {
      const contractConnection = await connectToContract(PRIVATE_KEY);

      const diplomaDataForHash = { 
        fullName: `${lastName} ${firstName}`,
        degree: `${Diploma} ${specialty}`, 
        academicFullYear: academicFullYear, 
      };

      const onChainDiplomaHash = generateDiplomaHash(diplomaDataForHash); 
      console.log("Generated diploma hash (for on-chain and PDF):", onChainDiplomaHash);


      const issueResult = await issueDiploma(contractConnection, { 
        ...diplomaDataForHash, 
        hash: onChainDiplomaHash,
      });
      
      console.log("Blockchain issue result:", issueResult);


      if (onHashGenerated) {
        onHashGenerated({ 
          hash: onChainDiplomaHash, 
          txHash: issueResult.txHash 
        });
      }
      
      createFolder();
      writeLog();


      return issueResult; 

    } catch (error) {
      console.error("Blockchain error:", error.message);
      setQrHandlingInitiated(false); 
      setEnabledhide(false);
      if (onHashGenerated) {
        onHashGenerated({ error: error.message });
      }
      alert(`Erreur Blockchain: ${error.message}`);
      throw error; 
    }
  };

  const generateData = async () => {
    if (isDisabled) return;
    setQrHandlingInitiated(true); 
    setEnabledhide(false); 

    try {

      await storeDiplomaToBlockchain(); 

       const diplomaVerificationHashForQR = generateDiplomaHash({ 
        fullName: `${lastName} ${firstName}`,
        degree: `${Diploma} ${specialty}`,
        academicFullYear: academicFullYear,
      });

      const xmlsFR = generateQrXml({ 
        diplomaType: Diploma,
        fullName: `${lastName} ${firstName}`,
        id,
        specialty,
        birthDate: naissance, 
        academicFullYear: academicFullYear,
        dateProces,
        mention: mention, 
        soutenancePV,
        diplomaVerificationHash: diplomaVerificationHashForQR, 
      });

      processQrRequest(xmlsFR, { 
        onSuccess: () => {
         
        },
        onError: (msg) => {
          alert(msg);
          setQrHandlingInitiated(false); 
          setEnabledhide(false);
        },
        onQrImage: (image) => {
          setEnabledhide(true); 
          if (parentcallback) {
            parentcallback(image, false, id, specialty, Diploma, academicFullYear);
          }
          if (callback) {
            callback(image); 
          }
        },
      }).catch((err) => {
        console.error("QR Generation Error:", err);
        setQrHandlingInitiated(false); 
        setEnabledhide(false);
      });

    } catch (error) {

      console.error("Error in generateData after blockchain step:", error);
      setQrHandlingInitiated(false);
      setEnabledhide(false);
    }
  };
  

  return (
    <button
      className={isDisabled ? "cancel-button-disabled" : "cancel-button"}
      disabled={isDisabled}
      type="button"
      onClick={generateData}
    >
      Générer QR
    </button>
  );
}

export default QrHandling;