import React, { useState, useEffect } from "react";
import "../Form/uniForm.css"; 
import { Checkbox } from "@material-ui/core";
import configData from "../../helpers/config.json"; 
import QrHandling from "../QrHandling/QrHandling.js"; 
import "../QrHandling/QrButtonStyle.css"; 
import DiplomaPreview from "../PdfHandling/DiplomaPreview.js"; 
import PdfHandler from "../PdfHandling/pdfHandler.js"; 
import {
  diplomaOptions,
  specialtiesMapping,
  specialtieOptions,
  mentionOptions,
  getAcademicYears
} from "../../helpers/diplomaUtils.js"; 
//import { uploadToIPFS, getIPFSUrl } from "../../helpers/ipfsService.js"; 
import VerificationDisplay from "../Verif/Verif.js";

const ipc = window.require ? window.require("electron").ipcRenderer : null;

const UniFormulaire = ({ base64, parentcallback, selectedDegree, speciality }) => {
  const [enabledhide, setEnabledhide] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false); 
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [id, setId] = useState(""); 
  const [naissance, setNaissance] = useState("");
  const [lieu, setLieu] = useState("");
  const [imageQR64, setImageQR64] = useState(null);
  const [pdf, setPdf] = useState({ height: null, width: null });
  const [pdfBytes, setPdfBytes] = useState(null);
  const [image, setImage] = useState("");
  const [isPdfGenerated, setIsPdfGenerated] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false); 

  const [onChainDiplomaHash, setOnChainDiplomaHash] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null); 

  //const [ipfsCid, setIpfsCid] = useState(null);
  //const [ipfsUrl, setIpfsUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false); 
  const [diplomaMetadata, setDiplomaMetadata] = useState({}); 

  const academicFullYearInitial = getAcademicYears(); 
  const currentYear = new Date().getFullYear().toString();
  const previousYear = (new Date().getFullYear() - 1).toString();
  const [Year, setYear] = useState(currentYear);
  const [LastYear, setLastYear] = useState(previousYear);
  
  const getAcademicYearString = (last, current) => `${last.slice(-2)}/${current.slice(-2)}`;
  const getAcademicFullYearString = (last, current) => `${last}-${current}`;

  /*const clearIpfsData = () => {
    setIpfsCid(null);
    setIpfsUrl(null);
    setDiplomaMetadata(prev => ({
        ...prev,
        ipfsCid: null,
        ipfsUrl: null
    }));
  };*/

  const handlePdfGenerate = (height, width) => {
    setPdf({ height, width });
  };
  const handleImageGenerate = (image) => {
    setImage(image);
  };

  const handlePdfBytesGenerate = (newPdfBytes) => {
    setPdfBytes(newPdfBytes);
    setIsPdfGenerated(true); 
  };

  const handleQRCodeUpdate = (qrCode) => {
    setImageQR64(qrCode);
    // setQrGenerated(true);
  };

  const handleOnChainHashGenerated = (data) => {

    const currentAcademicFullYear = getAcademicFullYearString(LastYear, Year);
    if (data && data.error) {
        console.error("Error from QrHandling during hash/tx generation:", data.error);
        setOnChainDiplomaHash(null);
        setTransactionHash(null);
        setDiplomaMetadata({ 
            onChainHash: null,
            txHash: null,
            academicFullYear: currentAcademicFullYear,
            studentFullName: `${lastName} ${firstName}`,
            degreeName: `${formData.Diploma} ${formData.specialty}`,
            studentId: id,
            ipfsCid: null,
            ipfsUrl: null
        });
        //clearIpfsData(); 
    } else if (data && data.hash) {
        setOnChainDiplomaHash(data.hash);
        setTransactionHash(data.txHash || null);
        setDiplomaMetadata({
            onChainHash: data.hash,
            txHash: data.txHash || null,
            academicFullYear: currentAcademicFullYear, 
            studentFullName: `${lastName} ${firstName}`,   
            degreeName: `${formData.Diploma} ${formData.specialty}`, 
            studentId: id,                             
            ipfsCid: null, 
            ipfsUrl: null  
        });
        //clearIpfsData(); 
    } else { 
        console.warn("Received unexpected data structure in handleOnChainHashGenerated:", data);
        setOnChainDiplomaHash(null); 
        setTransactionHash(null);
        setDiplomaMetadata(prev => ({ 
            ...prev, 
            onChainHash: typeof data === 'string' ? data : null, 
            txHash: null,
            academicFullYear: currentAcademicFullYear,
            studentFullName: `${lastName} ${firstName}`,
            degreeName: `${formData.Diploma} ${formData.specialty}`,
            studentId: id,
        }));
       // clearIpfsData();
    }
  };

  const initialFormState = { 
    Diploma: "", 
    specialty: "", 
    mention: "", 
    dateProces: "", 
    soutenancePV: "",
    academicYear: getAcademicYearString(previousYear, currentYear), 
    academicFullYear: getAcademicFullYearString(previousYear, currentYear),
    checkedDuplicata: false
  };

  const [formData, setFormData] = useState(initialFormState);
  const [availableSpecialties, setAvailableSpecialties] = useState([]);
  const [checkedDuplicata, setCheckedDuplicata] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => { 
    if (selectedDegree && diplomaOptions[selectedDegree]) {
      const diplomaValue = diplomaOptions[selectedDegree].value;
      const contextSpecialty = speciality && specialtiesMapping[speciality] ? specialtiesMapping[speciality] : "";
      const newSpecialties = specialtieOptions[diplomaValue] || [];;

      setFormData((prevState) => ({
        ...initialFormState, 
        Diploma: diplomaValue,
        specialty: contextSpecialty,
        checkedDuplicata: checkedDuplicata, 
      }));
      setAvailableSpecialties(newSpecialties);

      const index = contextSpecialty && newSpecialties.includes(contextSpecialty)
        ? newSpecialties.indexOf(contextSpecialty) + 1
        : 0;
      setSelectedIndex(index);
    }
  }, [selectedDegree, speciality, checkedDuplicata]);


  
  const commonPdfInvalidatingChangeActions = () => {
    setIsPdfGenerated(false); 
    //clearIpfsData();       
    setHasDownloaded(false);
    
    setOnChainDiplomaHash(null); 
    setTransactionHash(null);
    setDiplomaMetadata(prev => ({
        ...prev, 
        onChainHash: null,
        txHash: null,
        academicFullYear: getAcademicFullYearString(LastYear, Year),
        studentFullName: `${lastName} ${firstName}`, 
        degreeName: `${formData.Diploma} ${formData.specialty}`, 
        studentId: id, 
    }));
    setQrGenerated(false); 
    setImageQR64(null);
  };
  

  const handleDiplomaChange = (e) => {
    const selectedDiploma = e.target.value;
    const newSpecialties = specialtieOptions[selectedDiploma] || [];
    setAvailableSpecialties(newSpecialties);
    setFormData({
      ...initialFormState, Diploma: selectedDiploma, specialty: "",
      checkedDuplicata: checkedDuplicata,
    });
    setSelectedIndex(0);
    commonPdfInvalidatingChangeActions();
  };

  const handleSpecialtyChange = (e) => {
    setFormData({ ...formData, specialty: e.target.value });
    setSelectedIndex(e.target.selectedIndex);
    commonPdfInvalidatingChangeActions();
  };
  const handleChangeFirstAcademicYear = (e) => {
    const newYear = e.target.value.slice(0, 4);
    setLastYear(newYear); 
    setYear((parseInt(newYear, 10) + 1).toString());
    commonPdfInvalidatingChangeActions();
  };
  const handleChangeSecondAcademicYear = (e) => {
    const newYear = e.target.value.slice(0, 4);
    setYear(newYear); 
    setLastYear((parseInt(newYear, 10) - 1).toString());
    commonPdfInvalidatingChangeActions();
  };
  const handleChangeDuplicata = (event) => {
    setCheckedDuplicata(event.target.checked);
    setFormData(prev => ({ ...prev, checkedDuplicata: event.target.checked }));
    commonPdfInvalidatingChangeActions();
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setFirstName("");
    setLastName("");
    setId("");
    setNaissance("");
    setLieu("");
    setImageQR64(null);
    setAvailableSpecialties([]);
    setShowPreview(false);
    setCheckedDuplicata(false);
    setEnabledhide(false);
    setQrGenerated(false);
    setImage("");
    setPdf({ height: null, width: null });
    setPdfBytes(null);
    setIsPdfGenerated(false);
    setLastYear(previousYear);
    setYear(currentYear);
    setHasDownloaded(false);
    parentcallback("", false, "", "", "", "", "", "", "");
    setDiplomaMetadata({});
    setOnChainDiplomaHash(null); 
    setTransactionHash(null);
  };

  const isActiveFieldsValid = () => {
    const commonFieldsValid = (
        firstName.trim() !== "" && lastName.trim() !== "" && id.trim() !== "" &&
        naissance.trim() !== "" && lieu.trim() !== "" &&
        LastYear.trim() !== "" && Year.trim().length === 4 && formData.Diploma.trim() !== ""
      );
      if (!commonFieldsValid) return false;
      switch (formData.Diploma) {
        case "Licence": case "Doctorat": case "Mastère":
          return (formData.specialty.trim() !== "" && formData.dateProces.trim() !== "" && formData.mention.trim() !== "");
        case "Ingénieur":
          return (formData.specialty.trim() !== "" && formData.dateProces.trim() !== "");
        case "Architecture":
          return (formData.soutenancePV.trim() !== "" && formData.dateProces.trim() !== "");
        default: return false;
      }
  };

  /*const performIpfsUpload = async (bytesToUpload, hashForFilename) => {
    if (isUploading) {
      console.warn("IPFS upload attempt skipped: An upload is already in progress.");
      return;
    }

    if (!bytesToUpload || !hashForFilename) {
      console.error("IPFS upload failed pre-check: PDF bytes or onChainDiplomaHash missing.");
      alert("Données critiques manquantes pour le téléversement IPFS (PDF ou Hash).");
      return; 
    }*/

   /* setIsUploading(true);
    try {
      const diplomaFileNameForIPFS = `${hashForFilename}.pdf`;
      console.log(`AUTO UPLOAD: Attempting to upload to IPFS with filename: ${diplomaFileNameForIPFS}`);

      const cid = await uploadToIPFS(bytesToUpload, diplomaFileNameForIPFS);
      const url = getIPFSUrl(cid, diplomaFileNameForIPFS);

      setIpfsCid(cid);
      setIpfsUrl(url);
      setDiplomaMetadata(prev => ({
        ...prev, 
        ipfsCid: cid,
        ipfsUrl: url,
        onChainHash: hashForFilename, 
      }));

      console.log(`✅ AUTO UPLOAD: PDF successfully uploaded to IPFS. CID: ${cid}, URL: ${url}`);
      alert(`Diplôme automatiquement téléversé sur IPFS: ${url}`);
    } catch (error) {
      console.error("❌ AUTO UPLOAD: Failed to upload PDF to IPFS:", error);
      alert(`Erreur lors du téléversement automatique sur IPFS: ${error.message || 'Erreur inconnue'}`);
      setDiplomaMetadata(prev => ({
          ...prev,
          ipfsCid: null,
          ipfsUrl: null
      }));
    } finally {
      setIsUploading(false);
    }
  };*/

  useEffect(() => {
    if (pdfBytes && onChainDiplomaHash && !hasDownloaded) { 
      console.log("useEffect: Conditions met for IPFS upload. Calling performIpfsUpload.");
      //performIpfsUpload(pdfBytes, onChainDiplomaHash);
    }
  }, [pdfBytes, onChainDiplomaHash, isUploading, hasDownloaded]); 


  async function downloadPDF() {
    /*if (isUploading && !ipfsUrl) { 
        alert("Le téléversement IPFS est en cours. Veuillez patienter pour que les informations IPFS soient complètes.");
        return; // Prevent download if critical IPFS info is missing due to ongoing upload
    }

    if (pdfBytes) {
      if (!ipfsUrl && onChainDiplomaHash) { 
        console.warn("L'URL IPFS n'est pas encore disponible. Le téléversement automatique est peut-être en cours ou a échoué. Téléchargement local en cours...");
      } else if (ipfsUrl) {
        console.log("IPFS upload complété ou URL disponible. Initiation du téléchargement local...");
      }*/

      const currentAcademicFullYear = getAcademicFullYearString(LastYear, Year);
      if (ipc) {
        ipc.send(
          "downloadPDF",
          id,
          formData.specialty,
          formData.Diploma,
          checkedDuplicata,
          currentAcademicFullYear, 
          pdfBytes,
          false, 
          /*{ 
            ipfsCid: diplomaMetadata.ipfsCid, // from metadata state
            ipfsUrl: diplomaMetadata.ipfsUrl, // from metadata state
            onChainHash: diplomaMetadata.onChainHash, // from metadata state
            transactionHash: diplomaMetadata.txHash,  // from metadata state
            ipfsFileName: diplomaMetadata.ipfsCid && diplomaMetadata.onChainHash ? `${diplomaMetadata.onChainHash}.pdf` : null
          }*/
        );
        setHasDownloaded(true); 
      }/* else {
        alert("Le mécanisme de téléchargement local (IPC) n'est pas disponible.");
      }
    } else {
      alert("Les données du PDF ne sont pas disponibles pour le téléchargement local.");
    }*/
  }

  const renderDiplomaSpecificFields = () => { 
    const fieldsDisabled = qrGenerated || isUploading;
    const createChangeHandler = (fieldName) => (e) => {
        setFormData({ ...formData, [fieldName]: e.target.value });
        commonPdfInvalidatingChangeActions(); 
    };
    switch (formData.Diploma) {
        case "Licence": case "Doctorat": case "Mastère":
          return (<div className="mt-4">
              <label className="speciality-label">Specialité *</label>
              <select id="speciality" className="input speciality-input" value={formData.specialty} onChange={handleSpecialtyChange} disabled={fieldsDisabled}>
                <option value="" disabled>Choisir une spécialité</option>
                {availableSpecialties.map((sp, idx) => (<option key={idx} value={sp}>{sp}</option>))}
              </select>
              <label className="proces-label">Procès-verbal *</label>
              <input className="input proces-input" type="date" min="1980-01-01" max="2050-12-31" disabled={fieldsDisabled} value={formData.dateProces} onChange={createChangeHandler("dateProces")}/>
              <label className="mention-label">Mention *</label>
              <select id="mention" className="input mention-input" value={formData.mention} onChange={createChangeHandler("mention")} disabled={fieldsDisabled}>
                <option value="" disabled>Sélectionner une mention</option>
                {mentionOptions.map((opt, idx) => (<option key={idx} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>);
        case "Ingénieur":
          return (<div className="mt-4">
              <label className="speciality-label">Specialité *</label>
              <select id="speciality" className="input speciality-input" value={formData.specialty} onChange={handleSpecialtyChange} disabled={fieldsDisabled}>
                <option value="" disabled>Choisir une spécialité</option>
                {availableSpecialties.map((sp, idx) => (<option key={idx} value={sp}>{sp}</option>))}
              </select>
              <label className="proces-label">Procès-verbal *</label>
              <input className="input proces-input" type="date" min="1980-01-01" max="2050-12-31" disabled={fieldsDisabled} value={formData.dateProces} onChange={createChangeHandler("dateProces")}/>
            </div>);
        case "Architecture":
          return (<div className="mt-4">
              <label className="soutenancePV-label">Procès-verbal Soutenance *</label>
              <input className="input soutenancePV-input" type="date" min="1980-01-01" max="2050-12-31" disabled={fieldsDisabled} value={formData.soutenancePV} onChange={createChangeHandler("soutenancePV")}/>
              <label className="proces-label">Procès-verbal *</label>
              <input className="input proces-input" type="date" min="1980-01-01" max="2050-12-31" disabled={fieldsDisabled} value={formData.dateProces} onChange={createChangeHandler("dateProces")}/>
            </div>);
        default: return null;
      }
  };
  const createBaseChangeHandler = (setterFunction, fieldName) => (e) => {
    setterFunction(e.target.value);
    commonPdfInvalidatingChangeActions(); 
    // Update diplomaMetadata for real-time fields like name, if desired, though it's largely set post-hash-gen
    if (fieldName === "lastName" || fieldName === "firstName") {
        setDiplomaMetadata(prev => ({...prev, studentFullName: fieldName === "lastName" ? `${e.target.value} ${firstName}` : `${lastName} ${e.target.value}`}));
    } else if (fieldName === "id") {
        setDiplomaMetadata(prev => ({...prev, studentId: e.target.value}));
    }
  };
  return (
    <>
    {pdfBytes && <VerificationDisplay metadata={diplomaMetadata} />}
      {!showPreview ? (
        <section className="form-section">
          <h3 className="form-title">Formulaire</h3>
          <div className="reload-icon">
            <button className="btn" onClick={resetForm} title="Reset Form"><i className="fa fa-undo"></i></button>
            <span className="tooltiptext">Reset</span>
          </div>
          <hr className="first-line" />
          <form><div className="form-wrapper"><div className="div-scroll">
            <div className="form-group">
              <label className="university-label">Université *</label>
              <input id="university" className="input university-input" type="text" value={configData.UNIVERSITY} readOnly />
            </div>
            <div className="form-group">
              <label htmlFor="institution" className="institution-label">Établissement *</label>
              <input id="institution-input" className="input institution-input" type="text" value={configData.ETABLISSEMENT.FR} readOnly />
            </div>
            <div className="name-group">
              <div className="form-group">
                <label className="firstname-label">Nom Étudiant *</label>
                <input id="lastname" className="input firstname-input" disabled={qrGenerated || isUploading} value={lastName} type="text" name="lastname" onChange={createBaseChangeHandler(setLastName, "lastName")} />
              </div>
              <div className="form-group">
                <label className="lastname-label">Prénom Étudiant *</label>
                <input id="firstname" className="input lastname-input" disabled={qrGenerated || isUploading} value={firstName} type="text" name="firstname" onChange={createBaseChangeHandler(setFirstName, "firstName")} />
              </div>
            </div>
            <div className="form-group">
              <label className="id-label">Matricule *</label>
              <input id="studentId" className="input id-input" value={id} disabled={qrGenerated || isUploading} type="text" name="id" onChange={createBaseChangeHandler(setId, "id")} />
            </div>
            <div className="birth-group">
              <div className="form-group">
                <label className="date-label">Date de naissance *</label>
                <input id="birthDate" className="input date-input1" type="date" disabled={qrGenerated || isUploading} min="1980-01-01" max="2050-12-31" value={naissance} onChange={createBaseChangeHandler(setNaissance)} />
              </div>
              <div className="form-group">
                <label className="lieu-label">Lieu *</label>
                <input id="birthPlace" className="input lieu-input1" disabled={qrGenerated || isUploading} value={lieu} type="text" onChange={createBaseChangeHandler(setLieu)} />
              </div>
            </div>
            <div>
              <label className="academicYear-label">Année Universitaire *</label> <br />
              <input className="input academicYear-input" type="number" maxLength="4" disabled={qrGenerated || isUploading} value={LastYear} onChange={handleChangeFirstAcademicYear} />
              <label className="academicYear1-label"> / </label> <br />
              <input className="input academicYear1-input" type="number" maxLength="4" disabled={qrGenerated || isUploading} value={Year} onChange={handleChangeSecondAcademicYear} />
            </div>
            <div className="form-group">
              <label className="diplome-label">Diplôme *</label>
              <select id="diploma" className="input diplome-input" value={formData.Diploma} onChange={handleDiplomaChange} disabled={qrGenerated || isUploading}>
                <option value="" disabled>Sélectionner un diplôme</option>
                {Object.values(diplomaOptions).map((dip) => (<option key={dip.value} value={dip.value}>{dip.label}</option>))}
              </select>
            </div>

            {renderDiplomaSpecificFields()}

            <div className="form-duplicata">
              <label className="duplicata-label-L">Duplicata</label>
              <Checkbox className="duplicata-input-L" onChange={handleChangeDuplicata} disabled={qrGenerated || isUploading} checked={checkedDuplicata} />
            </div>
          </div></div>

            <div className="buttons-container">
              <QrHandling
                callback={handleQRCodeUpdate}
                onHashGenerated={handleOnChainHashGenerated} 
                isDisabled={!isActiveFieldsValid() || qrGenerated || isUploading}
                formData={{ 
                    ...formData, 
                    academicYear: getAcademicYearString(LastYear, Year), 
                    academicFullYear: getAcademicFullYearString(LastYear, Year), 
                    id, 
                    naissance, 
                    lastName, 
                    firstName, 
                    lieu, 
                    checkedDuplicata 
                }}
                parentcallback={parentcallback}
                setEnabledhide={setEnabledhide}
                setQrHandlingInitiated={setQrGenerated} 
              />
              <PdfHandler
                formData={{ 
                    ...formData, 
                    academicYear: getAcademicYearString(LastYear, Year), 
                    academicFullYear: getAcademicFullYearString(LastYear, Year), 
                    id, 
                    naissance, 
                    lastName, 
                    firstName, 
                    lieu, 
                    checkedDuplicata 
                }}
                handlePdfBytesGenerate={handlePdfBytesGenerate} 
                isActiveFieldsValid={isActiveFieldsValid}
                base64={base64}
                setShowPreview={setShowPreview}
                index={selectedIndex}
                imageQR64={imageQR64}
                pdfCallBack={handlePdfGenerate}
                handleImageGenerate={handleImageGenerate}
                checkedDuplicata={checkedDuplicata}
                pdfBytes={pdfBytes}
                isPdfGenerated={isPdfGenerated}
              />
            </div>
          </form>
        </section>
      ) : (
        <DiplomaPreview
          imageSrc={image || base64}
          onBackToForm={() => { setShowPreview(false); }}
          //onDownload={localDownloadPDF} 
          onDownload={downloadPDF}
          //isLoading={isUploading && !ipfsUrl} // IPFS handling
          isLoading={!image && !base64}
          dimensions={pdf}
          //hasDownloaded={hasDownloaded && !isUploading} 
          hasDownloaded={hasDownloaded}
          isProcessingDownload={isUploading} 
          diplomaHash={onChainDiplomaHash} 
          diplomaMetadata={diplomaMetadata} 
        />

      )}
    </>
  );
}; 

export default UniFormulaire;