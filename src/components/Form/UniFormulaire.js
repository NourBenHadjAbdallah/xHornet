import React, { useContext, useState, useEffect } from "react";
import "../Form/uniForm.css";

import { Checkbox } from "@material-ui/core";
import { NumberContext } from "../../pages/Loading/Loading.js";
import configData from "../../helpers/config.json";
import CircularProgress from "@material-ui/core/CircularProgress";

import QrHandling from "../QrHandling/QrHandling.js";
import PdfHandling from "../pdfHandling/PdfHandling.js";


const ipc = window.require("electron").ipcRenderer;
const PDFJS = window.pdfjsLib;

const UniFormulaire = ({base64, parentcallback }) => {
  // Form-related states
  const [diploma, setDiploma] = useState("");
  const [availableSpecialties, setAvailableSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [id, setId] = useState("");
  const [mention, setMention] = useState("");
  const [dateProces, setDateProces] = useState("");
  const [naissance, setNaissance] = useState("");
  const [soutenancePV, setSoutenancePV] = useState("");
  const [lieu, setLieu] = useState("");
  const [checkedDuplicata, setCheckedDuplicata] = useState(false);
  const [disableInput, setDisableInput] = useState(false);
  const [selectedSpecialtyIndex, setSelectedSpecialtyIndex] = useState(null);
  const [imageQR64, setImageQR64] = useState(null);
  const handleQRCodeUpdate = (qrCode) => {
    setImageQR64(qrCode);
  };


  // PDF/Preview-related states
  const [pdfBytes, setPdfBytes] = useState("");
  const [pdf, setPdf] = useState("");
  const [image, setImage] = useState("");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [show, setShow] = useState(false);
  const [enabledCanvas, setEnabledCanvas] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [enabledhide, setEnabledhide] = useState(false);


  // Academic year states
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const [Year, setYear] = useState(currentYear.toString());
  const [LastYear, setLastYear] = useState(previousYear.toString());
  const academicYear = `${LastYear.slice(-2)}/${Year.slice(-2)}`;
  const academicFullYear = `${currentYear}-${previousYear}`;

  // Retrieve parent's selected degree (and speciality) from context
  const { selectedDegree, speciality } = useContext(NumberContext);



const diplomaOptions = {
  "1": { value: "Bachelors", label: "Licence" },
  "3": { value: "Engineering", label: "Ingénieur" },
  "2": { value: "Architecture", label: "Architecture" },
};

  const specialtiesMapping = {
    // Bachelors specialties
    "10": "Génie Logiciel et système d'information",
    "11": "Business Intelligence",
    // Engineering specialties
    "20": "Génie Informatique",
    "21": "Génie Informatique de Gestion",
    "22": "Génie Télécommunications et Réseaux",
    "23": "Génie Electrique et Automatique",
    "24": "Génie Electromécanique",
    "25": "Génie Mécanique",
    "26": "Génie Biotechnologique",
    "27": "Génie Civil"
  };



  // Mention options
  const mentionOptions = [
    { value: "1", label: "Passable" },
    { value: "2", label: "Assez Bien" },
    { value: "3", label: "Bien" },
    { value: "4", label: "Très Bien" }
  ];

  // Specialty options for diplomas
  const specialtieOptions = {
    Engineering: [
      "Génie Informatique",
      "Génie Informatique de Gestion",
      "Génie Télécommunications & Réseaux",
      "Génie Electrique et Automatique",
      "Génie Electromécanique",
      "Génie Mécanique",
      "Génie Biotechnologique",
      "Génie Civil"
    ],
    Bachelors: [
      "Business Intelligence",
      "Génie Logiciel et système d'information"
    ]
  };

  // On mount, if the diploma is not yet set, use the mapping from parent's selected degree.
  useEffect(() => {
    if ( selectedDegree && diplomaOptions[selectedDegree]) {
      setDiploma(diplomaOptions[selectedDegree].value);
      if (speciality && specialtiesMapping[speciality]) {
        setSelectedSpecialty(specialtiesMapping[speciality]);
      }
    }
  }, [selectedDegree, speciality]);

  // Handler for diploma selection changes.
  const handleDiplomaChange = (e) => {
    const selectedDiploma = e.target.value;
    setDiploma(selectedDiploma);
    setAvailableSpecialties(specialtieOptions[selectedDiploma] || []);
    // Reset the specialty selection on diploma change.
    setSelectedSpecialty("");
  };

  // Handler for specialty selection.
  const handleSpecialtyChange = (e) => {
    const selectedOption = e.target.value;
    setSelectedSpecialty(selectedOption);
  
    // Get the index of the selected specialty
    const selectedIndex = e.target.selectedIndex;
    setSelectedSpecialtyIndex(selectedIndex);
  };

  // Handlers for academic year changes
  const handleChangeFirstAcademicYear = (e) => {
    const newYear = e.target.value.slice(0, 4);
    setLastYear(newYear);
    setYear((parseInt(newYear, 10) + 1).toString());
  };

  const handleChangeSecondAcademicYear = (e) => {
    const newYear = e.target.value.slice(0, 4);
    setYear(newYear);
    setLastYear((parseInt(newYear, 10) - 1).toString());
  };

  // Handler for duplicata checkbox
  const handleChangeDuplicata = (event) => {
    setCheckedDuplicata(event.target.checked);
  };

  // Reset the form to its initial values
  const reset = () => {
    setPdfBytes("");
    setPdf("");
    setImage("");
    setDiploma("");
    setEnabledCanvas(true);
    setDisableInput(false);
    setCheckedDuplicata(false);
    setDateProces("");
    setEnabled(true);
    setEnabledhide(false);
    setFirstName("");
    setLastName("");
    setId("");
    setAvailableSpecialties([]);
    setSelectedSpecialty("");
    // Do not reset Diploma here because it comes from the parent's selection initially.
    setMention("");
    setNaissance("");
    setLastYear(previousYear.toString());
    setYear(currentYear.toString());
    setLieu("");
  };

  // Render diploma-specific fields based on the current diploma.
  const renderDiplomaSpecificFields = () => {
    if (diploma === "Bachelors") {
      return (
        <div className="mt-4">
          <label className="speciality-label">Specialité *</label>
          <select
            id="speciality"
            className="input speciality-input"
            value={selectedSpecialty}
            onChange={handleSpecialtyChange}
          >
            <option value="">
              {diploma
                ? specialtieOptions[diploma]?.length
                  ? "Choisir une spécialité"
                  : "Aucune spécialité disponible"
                : "Sélectionnez d'abord un diplôme"}
            </option>
            {specialtieOptions[diploma]?.map((specialty, index) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
          <label className="proces-label">Procès-verbal*</label>
          <input
            className="input proces-input"
            type="date"
            min="1980-01-01"
            max="2050-12-31"
            disabled={disableInput}
            value={dateProces}
            onChange={(e) => setDateProces(e.target.value)}
          />
          <label className="mention-label">Mention *</label>
          <select
            id="mention"
            className="input mention-input"
            value={mention}
            onChange={(e) => setMention(e.target.value)}
            disabled={disableInput}
          >
            {mentionOptions.map((opt, index) => (
              <option key={index} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    } else if (diploma === "Engineering") {
      return (
        <div className="mt-4">
          <label className="speciality-label">Specialité *</label>
          <select
            id="speciality"
            className="input speciality-input"
            value={selectedSpecialty}
            onChange={handleSpecialtyChange}
          >
            <option value="">
              {diploma
                ? specialtieOptions[diploma]?.length
                  ? "Choisir une spécialité"
                  : "Aucune spécialité disponible"
                : "Sélectionnez d'abord un diplôme"}
            </option>
            {specialtieOptions[diploma]?.map((specialty) => (
              <option key={specialty} value={specialty}>
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
            disabled={disableInput}
            value={dateProces}
            onChange={(e) => setDateProces(e.target.value)}
          />
        </div>
      );
    } else if (diploma === "Architecture") {
      return (
        <div className="mt-4">
          <label className="soutenancePV-label">
            Procès-verbal Soutenance*
          </label>
          <input
            className="input soutenancePV-input"
            type="date"
            min="1980-01-01"
            max="2050-12-31"
            disabled={disableInput}
            value={soutenancePV}
            onChange={(e) => setSoutenancePV(e.target.value)}
          />
          <label className="proces-label-a">Procès-verbal *</label>
          <input
            className="input proces-input-a"
            type="date"
            min="1980-01-01"
            max="2050-12-31"
            disabled={disableInput}
            value={dateProces}
            onChange={(e) => setDateProces(e.target.value)}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {show === false ? (
        <section className="form-section">
          <h3 className="form-title">Formulaire</h3>
          <div className="reload-icon">
            <button className="btn" onClick={reset}>
              <i className="fa fa-undo"></i>
            </button>
            <span className="tooltiptext">Reset</span>
          </div>
          <hr className="first-line" />
          <form>
            <div className="form-wrapper">
              <div className="div-scroll">
                {/* University Input */}
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

                {/* Institution Input */}
                <div className="form-group">
                  <label htmlFor="institution" className="institution-label">
                    Établissement *
                  </label>
                  <input
                    id="institution"
                    className="input institution-input"
                    type="text"
                    value={configData.ETABLISSEMENT.FR}
                    readOnly
                  />
                </div>

                {/* Student Name Inputs */}
                <div className="name-group">
                  <div className="form-group">
                    <label className="firstname-label">Nom Étudiant *</label>
                    <input
                      id="lastname"
                      className="input firstname-input"
                      disabled={disableInput}
                      value={lastName}
                      type="text"
                      name="lastname"
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="lastname-label">Prénom Étudiant *</label>
                    <input
                      id="firstname"
                      className="input lastname-input"
                      disabled={disableInput}
                      value={firstName}
                      type="text"
                      name="firstname"
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Student ID Input */}
                <div className="form-group">
                  <label className="id-label">Matricule *</label>
                  <input
                    id="studentId"
                    className="input id-input"
                    value={id}
                    disabled={disableInput}
                    type="text"
                    name="id"
                    onChange={(e) => setId(e.target.value)}
                  />
                </div>

                {/* Birth Information */}
                <div className="birth-group">
                  <div className="form-group">
                    <label className="date-label">Date de naissance *</label>
                    <input
                      id="birthDate"
                      className="input date-input1"
                      type="date"
                      disabled={disableInput}
                      min="1980-01-01"
                      max="2050-12-31"
                      value={naissance}
                      onChange={(e) => setNaissance(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="lieu-label">Lieu *</label>
                    <input
                      id="birthPlace"
                      className="input lieu-input1"
                      disabled={disableInput}
                      value={lieu}
                      type="text"
                      onChange={(e) => setLieu(e.target.value)}
                    />
                  </div>
                </div>

                {/* Academic Year Inputs */}
                <div>
                  <label className="academicYear-label">
                    Année Universitaire*
                  </label>
                  <br />
                  <input
                    className="input academicYear-input"
                    type="number"
                    maxLength="4"
                    disabled={disableInput}
                    value={LastYear}
                    onChange={handleChangeFirstAcademicYear}
                  />
                  <label className="academicYear1-label"> / </label>
                  <br />
                  <input
                    className="input academicYear1-input"
                    type="number"
                    maxLength="4"
                    disabled={disableInput}
                    value={Year}
                    onChange={handleChangeSecondAcademicYear}
                  />
                </div>

                {/* Diploma Dropdown as Select */}
                <div className="form-group">
                  <label className="diplome-label">Diplôme *</label>
                  <select
                    id="diploma"
                    className="input diplome-input"
                    value={diploma}
                    onChange={handleDiplomaChange}
                  >
                    <option value="" disabled>
                      Sélectionner un diplôme
                    </option>
                    {Object.values(diplomaOptions).map((dip) => (
                      <option key={dip.value} value={dip.value}>
                        {dip.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Diploma-specific fields */}
                {renderDiplomaSpecificFields()}

                {/* Duplicata Checkbox */}
                <div className="form-duplicata">
                  <label className="duplicata-label-L">Duplicata</label>
                  <Checkbox
                    className="duplicata-input-L"
                    onClick={handleChangeDuplicata}
                    disabled={disableInput}
                    checked={checkedDuplicata}
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="buttons-container">
              <QrHandling
                  formData={{
                    diploma,
                    selectedSpecialty,
                    firstName,
                    lastName,
                    id,
                    mention,
                    dateProces,
                    naissance,
                    soutenancePV,
                    lieu,
                    checkedDuplicata,
                    academicYear,
                    academicFullYear,
                  }}
                  callback={handleQRCodeUpdate}
                  parentcallback={parentcallback}
                  setEnabledhide={setEnabledhide}
                  disabled={enabled}
                  enabled={enabled} setDisableInput={setDisableInput}
              ></QrHandling>
              <PdfHandling
                disabled={base64 ? true : false}
                type="button"
                onClick={() => {
                  setShow((show) => !show);
                }}

              index={selectedSpecialtyIndex}
              selectedSpecialty={selectedSpecialty}
                
                formData={{
                  firstName,
                  lastName,
                  id,
                  mention,
                  dateProces,
                  naissance,
                  soutenancePV,
                  lieu,
                  Year,
                  LastYear}}
                checkedDuplicata={checkedDuplicata}
                diploma={diploma}
                parentcallback={parentcallback}
                imageQR64={imageQR64}
                >
              </PdfHandling>

            </div>
          </form>
        </section>
      ) : (
        <section className="form-section">
          <h3 className="form-title">Aperçu Diplôme</h3>
          <hr className="first-line" />
          <div className="div-position">
            {image ? (
              <img src={image} alt="pdfImage" className="div-scroll" />
            ) : (
              <CircularProgress className="loader" />
            )}
            <canvas id="pdf-canvas" width={width} height={height}></canvas>
          </div>
          <div className="buttons-container">
            <button
              className="cancel-button"
              type="button"
              onClick={() => setShow(!show)}
            >
              Retour au formulaire
            </button>
            {image && enabledCanvas ? (
              <button className="telecharger-button" type="button">
                Télécharger Diplôme
              </button>
            ) : (
              <button className="telecharger-button-disabled" type="button">
                Télécharger Diplôme
              </button>
            )}
          </div>
        </section>
      )}
    </>
  );
};

export default UniFormulaire;
