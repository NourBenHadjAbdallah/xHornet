import React from "react";
import { useContext, useState, useEffect,useRef } from "react";
import "../Form/uniForm.css";
import { api } from "../../api.js";
import { Checkbox } from "@material-ui/core";
import { NumberContext } from '../../pages/Loading.js';
import configData from "../../helpers/config.json";
import { PDFDocument, rgb,StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import CircularProgress from "@material-ui/core/CircularProgress";
import { xmlFake } from "../../helpers/utils.js";


const ipc = window.require("electron").ipcRenderer;
var XMLParser = require("react-xml-parser");
const PDFJS = window.pdfjsLib;


const UniFormulaire = ({base64, parentcallback}) => {
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [Diploma, setDiploma] = useState();
  const [pdfBytes, setPdfBytes] = useState("");
  const [show, setShow] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [id,setId] = useState("");
  const [mention, setMention] = useState("");
  const [dateProces, setDateProces] = useState("");
  const [naissance, setNaissance] = useState("");
  const [soutenancePV, setSoutenancePV] = useState("");
  const [checkedDuplicata, setCheckedDuplicata] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [enabledhide, setEnabledhide] = useState(false);
  const [enabledCanvas, setEnabledCanvas] = useState(true);

  const [lieu, setLieu] = useState("");
  const [pdf, setPdf] = useState("");
  const [width, setWidth] = useState(0);
  const [image, setImage] = useState("");
  const [height, setHeight] = useState(0);
  const [imageQR64, setImageQR64] = useState("");
  const [disableInput, setDisableInput] = useState(false);
  var currentYear = new Date().getFullYear();
  var previousYear = currentYear - 1;
  let date = new Date().toLocaleDateString('en-GB'); 
  const [Year, setYear] = useState(currentYear.toString());
  const [LastYear, setLastYear] = useState(previousYear.toString());
  var academicYear = `${LastYear.slice(-2)}/${Year.slice(-2)}`;
  var academicFullYear = `${currentYear}-${previousYear}`;


  const handleChangeFirstAcademicYear = (e) => {
    setLastYear(e.target.value.toString().slice(0, 4));
    setYear((parseInt(e.target.value) + 1).toString().slice(0, 4));
  };
  const handleChangeSecondAcademicYear = (e) => {
    setLastYear((parseInt(e.target.value) - 1).toString().slice(0, 4));
    setYear(e.target.value.toString().slice(0, 4));
  };





      const handleChangeDuplicata = (event) => {
        setCheckedDuplicata(event.target.checked);
      };



          // Handle diploma change and update specialties
    const handleDiplomaChange = (e) => {
      const selected = e.target.value;
      setDiploma(selected);
      setSpecialties(specialtieOptions[selected] || []);
    };





    const reset = () => {
        setPdfBytes("");
        setPdf("");
        setImage("");
        setEnabledCanvas(true);
        setDisableInput(false);
        setCheckedDuplicata(false);
        setDateProces("");
        setEnabled(true);
        setEnabledhide(false);
        setFirstName("");
        setLastName("");
        setId("");
        setSpecialties("");
        setDiploma("");
        setMention("");
        setNaissance("");
        parentcallback("", false, "", "", "", "", "", "", "");
        setLastYear(LastYear);
        setYear(Year);
        setLieu("");
      };

      const diplomas = [
        { value: "Engineering", label: "Ingénieur" },
        { value: "Bachelors", label: "Licence" },
        { value: "Architecture", label: "Architecture" }
      ];
      const mentionOptions = [
        { value: "1", label: "Passable" },
        { value: "2", label: "Assez Bien" },
        { value: "3", label: "Bien" },
        { value: "4", label: "Très Bien" }
      ];

        // Mapping diplomas to their specialties
  const specialtieOptions = {
    Engineering: [
      "Génie Informatique",
      "Génie Informatique de Gestion",
      "Génie Télécommunications & Réseaux",
      "Génie Electrique et Automatique",
      "Génie Electromécanique",
      "Génie Mécanique",
      "Génie Biotechnologique",
      "Génie Civil",
    ],
    Bachelors: ["Business Intelligence", "Génie Logiciel et système d'information"],
  };

 /* const getSpecialityName = () => {
    const diplomaOptionsEn = {
      Engineering: [
      "Computer Engineering",
      "Management Computer Engineering",
      "Telecommunications et Networks Engineering",
      "Electrical and Automatic Engineering",
      "Electromechanical Engineering",
      "Mechanical Engineering",
      "Biotechnology Engineering",
      "Civil Engineering"
      ],
      Bachelors: ["Business Intelligence", "Information Systems and Software Engineering"],
    };
    const div1 = document.getElementById("diplome-select");
    //const specialityName= div1.options[div1.selectedIndex].text;

    setSpecialties(diplomaOptionsEn[div1.selectedIndex - 1]);
  };

  const conversionMentionEnglish = (value) => {
   
    let mentions = [
      "with standard pass",
      "with honours",
      "with high honours",
      "with highest honour"
     
    ];
    return mentions[Number(value) - 1];
  };

  function getspecialtyeEN(input) {
    var inputMap = {
      "10": "Information Systems and Software Engineering",
      "11": "Business Intelligence",

    };
  }

  const mentionEn = conversionMentionEnglish(mention)
  const specialtyEN = specialties===""?getspecialtyeEN(diplomas):specialties*/


    return (
        <>
          {show === false ? (
            <section className="form-section">
              <h3 className="form-title">Formulaire</h3>   
              <div className="reload-icon">
                {" "}
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
              <label className="university-label">
                Université *
              </label>
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
                <label className="firstname-label">
                  Nom Étudiant *
                </label>
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
                <label className="lastname-label">
                  Prénom Étudiant *
                </label>
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
              <label className="id-label">
                Matricule *
              </label>
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
                <label className="date-label">
                  Date de naissance *
                </label>
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
                <label className="lieu-label">
                  Lieu *
                </label>
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
            <label className="academicYear-label">Année Universitaire*</label>
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
  
            {/* Diploma Dropdown */}
            <div className="form-group">
              <label className="diplome-label">
                Diplôme *
              </label>
              <select
                id="diploma"
                className="input diplome-input"
                value={Diploma}
                onChange={(handleDiplomaChange) => setDiploma(handleDiplomaChange.target.value)}
              >
                <option value={""} name="" disabled>Sélectionner un diplôme</option>
                {diplomas.map((diploma) => (
                  <option key={diploma.value} value={diploma.value}>
                    {diploma.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Conditionally render input fields based on selected diploma */}
              <div className="mt-4">
              {Diploma === "Bachelors" && (
              <div>
                <lable className="speciality-label">Specialité *</lable>
                <select
                  id="speciality"
                  className="input speciality-input"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                >

                <option value="">
                {!Diploma 
                  ? "Sélectionnez d'abord un diplôme" 
                  : specialtieOptions[Diploma]?.length 
                    ? "Choisir une spécialité"
                    : "Aucune spécialité disponible"}
                </option>
                {specialtieOptions[Diploma]?.map((specialty) => (
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
                    <option key={index} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
            </div>
                
              )}
              {Diploma === "Engineering" && (
            <div >
            <lable className="speciality-label">Specialité *</lable>
            <select
            id="speciality"
            className="input speciality-input"
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value)}
            
          >
            <option value="">
              {!Diploma 
                ? "Sélectionnez d'abord un diplôme" 
                : specialtieOptions[Diploma]?.length 
                  ? "Choisir une spécialité"
                  : "Aucune spécialité disponible"}
            </option>
            {specialtieOptions[Diploma]?.map((specialty) => (
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
            
              )}
              {Diploma === "Architecture" && (
              <div>
                <label className="soutenancePV-label">Procès-verbal Soutenance*</label>
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
              )}
              </div>

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

  
          {/* Action Buttons */}
          <div className="buttons-container">

            <button type="button" className={ base64 ? "generate-button-disabled" : "generate-button"}>
              Visualiser Diplôme
            </button>
          </div>
        </form>

            </section>
          ) : (
            <section className="form-section">
              <h3 className="form-title">Aperçu Diplôme</h3>
              <hr className="first-line" />
              {
                <div className="div-position">
                  {image ? (
                    <img src={image} alt="pdfImage" className="div-scroll" />
                  ) : (
                    <CircularProgress className="loader"></CircularProgress>
                  )}
                  <canvas id="pdf-canvas" width={width} height={height}></canvas>
                </div>
              }
              <div className="buttons-container">
                <button
                  className="cancel-button"
                  type="button"
                  onClick={() => {
                    setShow((show) => !show);
                  }}
                >
                  Retour au formulaire
                </button>
                {image && enabledCanvas ? (
                  <button
                    className="telecharger-button"
                    type="button"

                  >
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
    }
export default UniFormulaire;

