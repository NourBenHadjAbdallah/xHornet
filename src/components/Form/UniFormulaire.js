import React, { useContext, useState, useEffect } from "react";
import "../Form/uniForm.css";
import { Button, Checkbox } from "@material-ui/core";
import { NumberContext } from "../../pages/Loading/Loading.js";
import configData from "../../helpers/config.json";
import CircularProgress from "@material-ui/core/CircularProgress";
import QrHandling from "../QrHandling/QrHandling.js";
import "../QrHandling/QrButtonStyle.css";

const UniFormulaire = ({ base64, parentcallback }) => {
  const { selectedDegree, speciality } = useContext(NumberContext);
  const [enabledhide, setEnabledhide] = useState(false);
  const [qrHandlingInitiated, setQrHandlingInitiated] = useState(false); // New state to track QR handling initiation
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [id, setId] = useState("");
  const [naissance, setNaissance] = useState("");
  const [lieu, setLieu] = useState("");

  const initialFormState = {
    Diploma: "",
    specialty: "",
    mention: "",
    dateProces: "",
    soutenancePV: "",
    checkedDuplicata: false,
    academicYear: "",
    academicFullYear: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [availableSpecialties, setAvailableSpecialties] = useState([]);
  const [disableInput, setDisableInput] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [image, setImage] = useState("");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const [Year, setYear] = useState(currentYear.toString());
  const [LastYear, setLastYear] = useState(previousYear.toString());
  const academicYear = `${LastYear.slice(-2)}/${Year.slice(-2)}`;
  const academicFullYear = `${currentYear}-${previousYear}`;

  const diplomaOptions = {
    "1": { value: "Licence", label: "Licence" },
    "3": { value: "Ingénieur", label: "Ingénieur" },
    "2": { value: "Architecture", label: "Architecture" },
  };

  const specialtiesMapping = {
    "10": "Génie Logiciel et système d'information",
    "11": "Business Intelligence",
    "20": "Génie Informatique",
    "21": "Génie Informatique de Gestion",
    "22": "Génie Télécommunications et Réseaux",
    "23": "Génie Electrique et Automatique",
    "24": "Génie Electromécanique",
    "25": "Génie Mécanique",
    "26": "Génie Biotechnologique",
    "27": "Génie Civil",
  };

  const mentionOptions = [
    { value: "1", label: "Passable" },
    { value: "2", label: "Assez Bien" },
    { value: "3", label: "Bien" },
    { value: "4", label: "Très Bien" },
  ];

  const specialtieOptions = {
    Ingénieur: [
      "Génie Informatique",
      "Génie Informatique de Gestion",
      "Génie Télécommunications et Réseaux",
      "Génie Electrique et Automatique",
      "Génie Electromécanique",
      "Génie Mécanique",
      "Génie Biotechnologique",
      "Génie Civil",
    ],
    Licence: ["Business Intelligence", "Génie Logiciel et système d'information"],
  };

  useEffect(() => {
    if (selectedDegree && diplomaOptions[selectedDegree]) {
      setFormData((prevState) => ({
        ...prevState,
        Diploma: diplomaOptions[selectedDegree].value,
        specialty: speciality && specialtiesMapping[speciality] ? specialtiesMapping[speciality] : "",
      }));
      setAvailableSpecialties(specialtieOptions[diplomaOptions[selectedDegree].value] || []);
    }
  }, [selectedDegree, speciality]);

  const handleDiplomaChange = (e) => {
    const selectedDiploma = e.target.value;
    setFormData({
      ...initialFormState,
      Diploma: selectedDiploma,
    });
    setAvailableSpecialties(specialtieOptions[selectedDiploma] || []);
  };

  const handleSpecialtyChange = (e) => {
    setFormData({ ...formData, specialty: e.target.value });
  };

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

  const handleChangeDuplicata = (event) => {
    setFormData({ ...formData, checkedDuplicata: event.target.checked });
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setFirstName("");
    setLastName("");
    setId("");
    setNaissance("");
    setLieu("");
    setAvailableSpecialties([]);
    setDisableInput(false);
    setShowPreview(false);
    setImage("");
    setWidth(0);
    setHeight(0);
    setEnabledhide(false);
    setQrHandlingInitiated(false); // Reset QR handling state
    parentcallback("", false, "", "", "", "", "", "", "");
    setLastYear(previousYear.toString());
    setYear(currentYear.toString());
  };

  // Check if the active fields are filled
  const isActiveFieldsValid = () => {
    switch (formData.Diploma) {
      case "Licence":
        return (
          formData.specialty.trim() !== "" &&
          formData.dateProces.trim() !== "" &&
          formData.mention.trim() !== ""
        );
      case "Ingénieur":
        return formData.specialty.trim() !== "" && formData.dateProces.trim() !== "";
      case "Architecture":
        return formData.soutenancePV.trim() !== "" && formData.dateProces.trim() !== "";
      default:
        return false;
    }
  };

  const renderDiplomaSpecificFields = () => {
    switch (formData.Diploma) {
      case "Licence":
        return (
          <div className="mt-4">
            <label className="speciality-label">Specialité *</label>
            <select
              id="speciality"
              className="input speciality-input"
              value={formData.specialty}
              onChange={handleSpecialtyChange}
            >
              <option value="" disabled>Choisir une spécialité</option>
              {availableSpecialties.map((specialty) => (
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
              value={formData.dateProces}
              onChange={(e) => setFormData({ ...formData, dateProces: e.target.value })}
            />
            <label className="mention-label">Mention *</label>
            <select
              id="mention"
              className="input mention-input"
              value={formData.mention}
              onChange={(e) => setFormData({ ...formData, mention: e.target.value })}
              disabled={disableInput}
            >
              <option value="" disabled>
                Sélectionner une mention
              </option>
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
            >
              <option value="" disabled>Choisir une spécialité</option>
              {availableSpecialties.map((specialty) => (
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
              value={formData.dateProces}
              onChange={(e) => setFormData({ ...formData, dateProces: e.target.value })}
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
              disabled={disableInput}
              value={formData.soutenancePV}
              onChange={(e) => setFormData({ ...formData, soutenancePV: e.target.value })}
            />
            <label className="proces-label">Procès-verbal *</label>
            <input
              className="input proces-input"
              type="date"
              min="1980-01-01"
              max="2050-12-31"
              disabled={disableInput}
              value={formData.dateProces}
              onChange={(e) => setFormData({ ...formData, dateProces: e.target.value })}
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

                <div>
                  <label className="academicYear-label">Année Universitaire *</label>
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

                <div className="form-group">
                  <label className="diplome-label">Diplôme *</label>
                  <select
                    id="diploma"
                    className="input diplome-input"
                    value={formData.Diploma}
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

                {renderDiplomaSpecificFields()}

                <div className="form-duplicata">
                  <label className="duplicata-label-L">Duplicata</label>
                  <Checkbox
                    className="duplicata-input-L"
                    onClick={handleChangeDuplicata}
                    disabled={disableInput}
                    checked={formData.checkedDuplicata}
                  />
                </div>
              </div>
            </div>

            <div className="buttons-container">
              <QrHandling

                isDisabled={!isActiveFieldsValid() || qrHandlingInitiated} // Disable after first click
                formData={{
                  ...formData,
                  academicYear,
                  academicFullYear,
                  id,naissance,lastName,firstName,lieu
                }}
                parentcallback={parentcallback}
                setEnabledhide={setEnabledhide}
                setQrHandlingInitiated={setQrHandlingInitiated} // Pass the setter function
              />
              <button
                type="button"
                className={base64 ? "generate-button-disabled" : "generate-button"}
                disabled={!isActiveFieldsValid()}
              >
                Visualiser Diplôme
              </button>
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
              onClick={() => setShowPreview(!showPreview)}
            >
              Retour au formulaire
            </button>
            {image && (
              <button className="telecharger-button" type="button">
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