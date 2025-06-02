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
  const [diplomaHash, setDiplomaHash] = useState(null);
  const [diplomaMetadata, setDiplomaMetadata] = useState(null);
  const academicFullYear = getAcademicYears(); 
  const currentYear = new Date().getFullYear().toString();
  const previousYear = (currentYear - 1).toString();
  const [Year, setYear] = useState(currentYear);
  const [LastYear, setLastYear] = useState(previousYear);
  const academicYear = `${LastYear.slice(-2)}/${Year.slice(-2)}`;

  const handlePdfGenerate = (height, width) => {
    setPdf({ height, width });
  };
  const handleImageGenerate = (image) => {
    setImage(image);
  };
  const handlePdfBytesGenerate = (pdfBytes) => {
    setPdfBytes(pdfBytes);
    setIsPdfGenerated(true);
  };

  const handleQRCodeUpdate = (qrCode) => {
    setImageQR64(qrCode);
    setQrGenerated(true);
  };

  const initialFormState = {
    Diploma: "",
    specialty: "",
    mention: "",
    dateProces: "",
    soutenancePV: "",
    academicYear: academicYear,
    academicFullYear: academicFullYear,
    checkedDuplicata: false // Added to initial state
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
      const newSpecialties = specialtieOptions[diplomaValue] || [];

      setFormData((prevState) => ({
        ...prevState,
        Diploma: diplomaValue,
        specialty: contextSpecialty,
        checkedDuplicata: checkedDuplicata // Ensure it's included
      }));
      setAvailableSpecialties(newSpecialties);

      const index = contextSpecialty && newSpecialties.includes(contextSpecialty) 
        ? newSpecialties.indexOf(contextSpecialty) + 1 
        : 0;
      setSelectedIndex(index);
    }
  }, [selectedDegree, speciality, checkedDuplicata]); // Added checkedDuplicata to dependencies

  const handleDiplomaChange = (e) => {
    const selectedDiploma = e.target.value;
    const newSpecialties = specialtieOptions[selectedDiploma] || [];
    setAvailableSpecialties(newSpecialties);

    const currentSpecialty = formData.specialty;
    const contextSpecialty = speciality && specialtiesMapping[speciality] ? specialtiesMapping[speciality] : "";
    let preservedSpecialty = "";
    if (currentSpecialty && newSpecialties.includes(currentSpecialty)) {
      preservedSpecialty = currentSpecialty;
    } else if (contextSpecialty && newSpecialties.includes(contextSpecialty)) {
      preservedSpecialty = contextSpecialty;
    }

    setFormData({
      ...initialFormState,
      Diploma: selectedDiploma,
      specialty: "",
      checkedDuplicata: checkedDuplicata // Preserve checkbox state
    });

    setSelectedIndex(0);
    setIsPdfGenerated(false);
  };

  const handleSpecialtyChange = (e) => {
    const newSpecialty = e.target.value;
    setFormData({ ...formData, specialty: newSpecialty });
    const index = e.target.selectedIndex;
    setSelectedIndex(index);
    setIsPdfGenerated(false);
  };

  const handleChangeFirstAcademicYear = (e) => {
    const newYear = e.target.value.slice(0, 4);
    setLastYear(newYear);
    setYear((parseInt(newYear, 10) + 1).toString());
    setIsPdfGenerated(false);
  };

  const handleChangeSecondAcademicYear = (e) => {
    const newYear = e.target.value.slice(0, 4);
    setYear(newYear);
    setLastYear((parseInt(newYear, 10) - 1).toString());
    setIsPdfGenerated(false);
  };

  const handleChangeDuplicata = (event) => {
    const isChecked = event.target.checked;
    setCheckedDuplicata(isChecked);
    setFormData(prev => ({ ...prev, checkedDuplicata: isChecked })); // Update formData
    setIsPdfGenerated(false);
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
  };

  const isActiveFieldsValid = () => {
    const commonFieldsValid = (
      firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      id.trim() !== "" &&
      naissance.trim() !== "" &&
      lieu.trim() !== "" &&
      LastYear.trim() !== "" &&
      Year.trim() !== "" &&
      formData.Diploma.trim() !== ""
    );

    if (!commonFieldsValid) return false;
  
    switch (formData.Diploma) {
      case "Licence":
      case "Doctorat":
      case "Mastère":
        return (
          formData.specialty.trim() !== "" &&
          formData.dateProces.trim() !== "" &&
          formData.mention.trim() !== ""
        );
      case "Ingénieur":
        return (
          formData.specialty.trim() !== "" &&
          formData.dateProces.trim() !== ""
        );
      case "Architecture":
        return (
          formData.soutenancePV.trim() !== "" &&
          formData.dateProces.trim() !== ""
        );
      default:
        return false;
    }
  };

  async function downloadPDF() {
    if (ipc) {
      ipc.send(
        "downloadPDF",
        id,
        formData.specialty,
        formData.Diploma,
        checkedDuplicata,
        academicFullYear,
        pdfBytes,
        false
      );
      setHasDownloaded(true);
    }
  }

  const renderDiplomaSpecificFields = () => {
    switch (formData.Diploma) {
      case "Licence":
      case "Doctorat":
      case "Mastère":
        return (
          <div className="mt-4">
            <label className="speciality-label">Specialité *</label>
            <select
              id="speciality"
              className="input speciality-input"
              value={formData.specialty}
              onChange={handleSpecialtyChange}
              disabled={qrGenerated}
            >
              <option value="" disabled>Choisir une spécialité</option>
              {availableSpecialties.map((specialty, index) => (
                <option key={index} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
            <label className="proces-label">Procès-verbal *</label>
            <input
              className="input proces-input"
              type="date"
              min="1980-01-01"
              max="2050-12-31"
              disabled={qrGenerated}
              value={formData.dateProces}
              onChange={(e) => {
                setFormData({ ...formData, dateProces: e.target.value });
                setIsPdfGenerated(false);
              }}
            />
            <label className="mention-label">Mention *</label>
            <select
              id="mention"
              className="input mention-input"
              value={formData.mention}
              onChange={(e) => {
                setFormData({ ...formData, mention: e.target.value });
                setIsPdfGenerated(false);
              }}
              disabled={qrGenerated}
            >
              <option value="" disabled>Sélectionner une mention</option>
              {mentionOptions.map((opt, index) => (
                <option key={index} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );
      case "Ingénieur":
        return (
          <div className="mt-4">
            <label className="speciality-label">Specialité *</label>
            <select
              id="speciality"
              className="input speciality-input"
              value={formData.specialty}
              onChange={handleSpecialtyChange}
              disabled={qrGenerated}
            >
              <option value="" disabled>Choisir une spécialité</option>
              {availableSpecialties.map((specialty, index) => (
                <option key={index} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
            <label className="proces-label">Procès-verbal *</label>
            <input
              className="input proces-input"
              type="date"
              min="1980-01-01"
              max="2050-12-31"
              disabled={qrGenerated}
              value={formData.dateProces}
              onChange={(e) => {
                setFormData({ ...formData, dateProces: e.target.value });
                setIsPdfGenerated(false);
              }}
            />
          </div>
        );
      case "Architecture":
        return (
          <div className="mt-4">
            <label className="soutenancePV-label">Procès-verbal Soutenance *</label>
            <input
              className="input soutenancePV-input"
              type="date"
              min="1980-01-01"
              max="2050-12-31"
              disabled={qrGenerated}
              value={formData.soutenancePV}
              onChange={(e) => {
                setFormData({ ...formData, soutenancePV: e.target.value });
                setIsPdfGenerated(false);
              }}
            />
            <label className="proces-label">Procès-verbal *</label>
            <input
              className="input proces-input"
              type="date"
              min="1980-01-01"
              max="2050-12-31"
              disabled={qrGenerated}
              value={formData.dateProces}
              onChange={(e) => {
                setFormData({ ...formData, dateProces: e.target.value });
                setIsPdfGenerated(false);
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {!showPreview ? (
        <section className="form-section">
          <h3 className="form-title">Formulaire</h3>
          <div className="reload-icon">
            <button className="btn" onClick={resetForm}>
              <i className="fa fa-undo"></i>
            </button>
            <span className="tooltiptext">Reset</span>
          </div>
          <hr className="first-line" />
          <form>
            <div className="form-wrapper">
              <div className="div-scroll">
                <div className="form-group">
                  <label className="university-label">Université *</label>
                  <input
                    id="university"
                    className="input university-input"
                    type="text"
                    value={configData.UNIVERSITY}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="institution" className="institution-label">Établissement *</label>
                  <input
                    id="institution-input"
                    className="input institution-input"
                    type="text"
                    value={configData.ETABLISSEMENT.FR}
                    readOnly
                  />
                </div>
                <div className="name-group">
                  <div className="form-group">
                    <label className="firstname-label">Nom Étudiant *</label>
                    <input
                      id="lastname"
                      className="input firstname-input"
                      disabled={qrGenerated}
                      value={lastName}
                      type="text"
                      name="lastname"
                      onChange={(e) => {
                        setLastName(e.target.value);
                        setIsPdfGenerated(false);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="lastname-label">Prénom Étudiant *</label>
                    <input
                      id="firstname"
                      className="input lastname-input"
                      disabled={qrGenerated}
                      value={firstName}
                      type="text"
                      name="firstname"
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        setIsPdfGenerated(false);
                      }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="id-label">Matricule *</label>
                  <input
                    id="studentId"
                    className="input id-input"
                    value={id}
                    disabled={qrGenerated}
                    type="text"
                    name="id"
                    onChange={(e) => {
                      setId(e.target.value);
                      setIsPdfGenerated(false);
                    }}
                  />
                </div>
                <div className="birth-group">
                  <div className="form-group">
                    <label className="date-label">Date de naissance *</label>
                    <input
                      id="birthDate"
                      className="input date-input1"
                      type="date"
                      disabled={qrGenerated}
                      min="1980-01-01"
                      max="2050-12-31"
                      value={naissance}
                      onChange={(e) => {
                        setNaissance(e.target.value);
                        setIsPdfGenerated(false);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="lieu-label">Lieu *</label>
                    <input
                      id="birthPlace"
                      className="input lieu-input1"
                      disabled={qrGenerated}
                      value={lieu}
                      type="text"
                      onChange={(e) => {
                        setLieu(e.target.value);
                        setIsPdfGenerated(false);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="academicYear-label">Année Universitaire *</label>
                  <br />
                  <input
                    className="input academicYear-input"
                    type="number"
                    maxLength="4"
                    disabled={qrGenerated}
                    value={LastYear}
                    onChange={handleChangeFirstAcademicYear}
                  />
                  <label className="academicYear1-label"> / </label>
                  <br />
                  <input
                    className="input academicYear1-input"
                    type="number"
                    maxLength="4"
                    disabled={qrGenerated}
                    value={Year}
                    onChange={handleChangeSecondAcademicYear}
                  />
                </div>
                <div className="form-group">
                  <label className="diplome-label">Diplôme *</label>
                  <select
                    id="diploma"
                    className="input diplome-input"
                    value={formData.Diploma}
                    onChange={handleDiplomaChange}
                    disabled={qrGenerated}
                  >
                    <option value="" disabled>Sélectionner un diplôme</option>
                    {Object.values(diplomaOptions).map((dip) => (
                      <option key={dip.value} value={dip.value}>
                        {dip.label}
                      </option>
                    ))}
                  </select>
                </div>
                {renderDiplomaSpecificFields()}
                <div className="form-duplicata">
                  <label className="duplicata-label-L">Duplicata</label>
                  <Checkbox
                    className="duplicata-input-L"
                    onChange={handleChangeDuplicata} // Changed to onChange
                    disabled={qrGenerated}
                    checked={checkedDuplicata}
                  />
                </div>
              </div>
            </div>
            <div className="buttons-container">
              <QrHandling
                callback={handleQRCodeUpdate}
                isDisabled={!isActiveFieldsValid() || qrGenerated}
                formData={{
                  ...formData,
                  academicYear,
                  academicFullYear,
                  id,
                  naissance,
                  lastName,
                  firstName,
                  lieu,
                  checkedDuplicata // Ensure this is passed
                }}
                parentcallback={parentcallback}
                setEnabledhide={setEnabledhide}
                setQrHandlingInitiated={setQrGenerated}
              />
              <PdfHandler
                formData={{
                  ...formData,
                  academicYear,
                  academicFullYear,
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
                handleDiplomaHash={(hash, metadata) => {
                  setDiplomaHash(hash);
                  setDiplomaMetadata(metadata);
                }}

              />

            </div>
          </form>
        </section>
      ) : (
        <DiplomaPreview
          imageSrc={image || base64}
          onBackToForm={() => setShowPreview(false)}
          onDownload={downloadPDF}
          isLoading={!image && !base64}
          dimensions={pdf}
          hasDownloaded={hasDownloaded}
          diplomaHash={diplomaHash} // 👈 add this
          diplomaMetadata={diplomaMetadata} // 👈 and this
        />
      )}
    </>
  );
};

export default UniFormulaire;