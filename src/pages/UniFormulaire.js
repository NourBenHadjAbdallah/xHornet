import React from "react";
import { useContext, useState, useEffect,useRef } from "react";
import "../css/main-interface.css";
import { api } from "../api";
import { Checkbox } from "@material-ui/core";
import { NumberContext } from './Loading';
import configData from "../helpers/config.json";
import { PDFDocument, rgb,StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import CircularProgress from "@material-ui/core/CircularProgress";
import { xmlFake } from "../helpers/utils.js";

const ipc = window.require("electron").ipcRenderer;
var XMLParser = require("react-xml-parser");
const PDFJS = window.pdfjsLib;


const UniFormulaire = ({base64, parentcallback,specialityDiploma, Filed}) => {
    const isComponentMounted = useRef();
      const { specialité, value, selected } = useContext(NumberContext);
    const [pdfBytes, setPdfBytes] = useState("");
    const [show, setShow] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [id,setId] = useState("");
    const [section] = useState(Filed);
    const [Diploma, setDiploma] = useState(specialityDiploma);
    const [mention, setMention] = useState("");
    const [dateProces, setDateProces] = useState("");
    const [naissance, setNaissance] = useState("");
    const [soutenancePV, setSoutenancePV] = useState("");
    const [checkedDuplicata, setCheckedDuplicata] = useState(false);
    const [enabled, setEnabled] = useState(true);
    const [enabledhide, setEnabledhide] = useState(false);
    const [enabledCanvas, setEnabledCanvas] = useState(true);
    const [speciality, setSpeciality] = useState("");
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

    function allValid(values) {
        return values.trim().length !== 0;
    }
      
    function isValidYear(value) {
        return value.trim().length === 4;
    }

    var conditionL =
    allValid([Diploma, mention, naissance, lieu, firstName, lastName, dateProces, id]) &&
    isValidYear(Year) &&
    isValidYear(LastYear);

    var conditionA =
    allValid([naissance, lieu, firstName, lastName, id, dateProces, soutenancePV]) &&
    isValidYear(Year) &&
    isValidYear(LastYear);

    var conditionI =
    allValid([naissance, lieu, firstName, lastName, Diploma, id, dateProces]) &&
    isValidYear(Year) &&
    isValidYear(LastYear);

    useEffect(() => {
        isComponentMounted.current = true;
      
        return () => {
          isComponentMounted.current = false;
        };
      }, []);
      
      useEffect(() => {
        
        if (conditionI && !enabledhide || conditionA && !enabledhide || conditionL && !enabledhide) {
          setEnabled(false);
        } else {
          setEnabled(true);
        }
      
        return () => {
          
          setEnabled(true);
        };
      }, [academicYear, conditionI, enabledhide]);

    async function createFolder() {
        ipc.send(
          "createFolder",
          id,
          section,
          Diploma,
          academicFullYear,
         false
        );
       
    }

    async function downloadPDF() {
        ipc.send(
          "downloadPDF",
          id,
          section,
          Diploma,
          checkedDuplicata,
          academicFullYear,
          pdfBytes,
          false
        );
      
      }
      async function writeLog() {
        ipc.send("logFile", id, Diploma, academicFullYear, checkedDuplicata);
        // ipc.on("logFile", (event, arg) => {
        //   setGeneratedQR(arg)
        //   console.log(arg);
          
        //   });
      }
      const handleChangeDuplicata = (event) => {
        setCheckedDuplicata(event.target.checked);
      };

      const getDiplome = (specialité, value) => {
        let diplomes = [];
      
        if (value === "3") {
          diplomes = [
            "info",
            "infoG",
            "telecom",
            "electrique",
            "electro",
            "mecanique",
            "bio",
            "civil",
          ];
          return "ing_" + diplomes[specialité - 20] + ".pdf";
        } else if (value === "2") {
          diplomes = ["licence_Genie_Logiciel", "licence_Business_Intelligence"];
          return diplomes[specialité - 10] + ".pdf";
        } else {
          diplomes = ["architecte"]; 
          return diplomes[specialité - 5] + ".pdf";
        }
      };


      //Convert number to month string
      const toMonthNameFrenchPV = (month) => {
    
        var inputMapMonths = {
          "01":"Janvier",
          "02":"Février",
          "03":"Mars",
          "04":"Avril",
          "05":"Mai",
          "06":"Juin",
          "07":"Juillet",
          "08":"Août",
          "09":"Septembre",
          "10":"Octobre",
          "11":"Novembre",
          "12":"Décembre"    
        };
        return inputMapMonths[month] ;
    
      };
      const conversionMentionFrench = (value) => {
        let mentions = [
          "Passable",
          "Assez bien",
          "Bien",
          "Très Bien",
          // "Honorable",
          // "Très Honorable",
          // "Très Honorable avec félicitation de la comité",
        ];
        return mentions[Number(value) - 1];
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


    //Reverse date to left to right date
    const reverseDateFrench = (date) => {
        let dateFR = date.replace(/-/g, "/");
        let monthFR = dateFR.substring(4, 8);
        let dayFR = dateFR.substring(8, 10);
        let yearFR = dateFR.substring(0, 4);
        return (dateFR = dayFR + monthFR + yearFR);
    };




    async function modifyPdf(type, data){
        switch (type) {
          case "licence":
            // Logic for Licence PDF modification
            console.log("Modifying Licence PDF", {
              firstName,
              lastName,
              id,
              naissance,
              lieu,
              mention,
              academicYear,
            });
            await handlePdfModification();
            break;
    
            case "ingénieur":
              // Logic for Ingénieur PDF modification
              console.log("Modifying Ingénieur PDF", {
                firstName,
                lastName,
                id,
                naissance,
                lieu,
                speciality,
                academicYear,
              });
              await handlePdfModification();
              break;
      
            case "architecture":
              // Logic for Architecture PDF modification
              console.log("Modifying Architecture PDF", {
                firstName,
                lastName,
                id,
                naissance,
                lieu,
                academicYear,
              });
              await handlePdfModification();
              break;
      
            default:
              console.warn("Unknown form type for PDF modification");
          }
    
      }

    const handlePdfModification = async () => {
        // Procès verbal date
        let dateProcesFR = reverseDateFrench(naissance);
        let monthProcesFR = toMonthNameFrenchPV(naissance.substring(5, 7));
      
        let procesVerbal = dateProcesFR.replace(/-/g, " ");
        procesVerbal =
            procesVerbal[0] +
            procesVerbal[1] +
            " " +
            monthProcesFR +
            " " +
            procesVerbal[6] +
            procesVerbal[7] +
            procesVerbal[8] +
            procesVerbal[9];
      
        let month = toMonthNameFrenchPV(date.substring(3, 5));
        let datePermutation = date.replace(/\//g, " ");
        datePermutation =
            datePermutation[0] +
            datePermutation[1] +
            " " +
            month +
            " " +
            datePermutation[6] +
            datePermutation[7] +
            datePermutation[8] +
            datePermutation[9];
      
        let birthEtudiantFR = reverseDateFrench(naissance);
        const diplomeName = getDiplome();
      
        const url = "./assets/" + diplomeName;
        const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
      
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        pdfDoc.registerFontkit(fontkit);
      
        const timesNewRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const timesNewRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
      
        const base64Image = imageQR64;
        const base64Icon = `data:image/png;base64,${base64Image}`;
        const pngImage = await pdfDoc.embedPng(base64Icon);
    }

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
        setDiploma("");
        setMention("");
        setNaissance("");
        parentcallback("", false, "", "", "", "", "", "", "");
        setLastYear(LastYear);
        setYear(Year);
        setLieu("");
      };

      const handleChangeFirstAcademicYear = (e) => {
        setLastYear(e.target.value.toString().slice(0, 4));
        setYear((parseInt(e.target.value) + 1).toString().slice(0, 4));
      };
      const handleChangeSecondAcademicYear = (e) => {
        setLastYear((parseInt(e.target.value) - 1).toString().slice(0, 4));
        setYear(e.target.value.toString().slice(0, 4));
      };
      const getSpecialityName = (speciality) => {
        switch (speciality) {
          case "1":
            return [
              "Computer Engineering",
              "Management Computer Engineering",
              "Telecommunications et Networks Engineering",
              "Electrical and Automatic Engineering",
              "Electromechanical Engineering",
              "Mechanical Engineering",
              "Biotechnology Engineering",
              "Civil Engineering",
            ];
          case "2":
            return [
              "Information Systems and Software Engineering",
              "Business Intelligence",
            ];
          default:
            console.error("Invalid speciality code.");
            return [];
        }
      };
      const getSpecialityEn = (speciality) => {
  switch (speciality) {
    case "1":
      return [
        "Computer Engineering",
        "Management Computer Engineering",
        "Telecommunications and Networks Engineering",
        "Electrical and Automatic Engineering",
        "Electromechanical Engineering",
        "Mechanical Engineering",
        "Biotechnology Engineering",
        "Civil Engineering",
      ];
    case "2":
      return [
        "Information Systems and Software Engineering",
        "Business Intelligence",
      ];
    default:
      console.error("Invalid speciality code.");
      return [];
  }
};

      const generatedata = () => {
        const mentionEn = conversionMentionEnglish(mention)
        const specialtyEN = speciality===""?getSpecialityEn(Diploma):speciality
    
        const xmlsEN = `<?xml version="1.0" encoding="UTF-8"?>
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
     const xmlsFR = `<?xml version="1.0" encoding="UTF-8"?>
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
                    <value>Business Intelligence</value>
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
        //call api
        api
          //.post("", configData.LANG === 1 ?xmlsEN:xmlsFR)
          .post("", xmlsEN)
          .then((res) => {
            setEnabledhide(true);
            var xmol = new XMLParser().parseFromString(
              configData.MODE === 1 ? res.data : xmlFake
            );
            xmol.getElementsByTagName("imageCev").map((item, i) => {
              parentcallback(
                item.value,
                false,
                id,
                firstName,
                lastName,
                section,
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
                <div className="div-scroll">
                  <label className="university-label">Université *</label>
                  <br />
                  <input
                    className="input university-input"
                    type="text"
                    value={configData.UNIVERSITY}
                    readOnly
                  />
                  <label className="institution-label">Établissement *</label>
                  <br />
                  <input
                    className="input institution-input"
                    type="text"
                    value={configData.ETABLISSEMENT.FR}
                    readOnly
                  />
                  <label className="firstname-label">Nom Étudiant *</label>
                  <br />
                  <input
                    className="input firstname-input"
                    type="text"
                    disabled={disableInput}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    name="firstname"
                  />
                  <label className="lastname-label">Prénom Étudiant *</label>
                  <br />
                  <input
                    className="input lastname-input"
                    type="text"
                    disabled={disableInput}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    name="lastname"
                  />
                  <label className="id-label">ID *</label>
                  <br />
                  <input
                    className="input id-input"
                    type="text"
                    name="id"
                    value={id}
                    disabled={disableInput}
                    onChange={(e) => setId(e.target.value)}
                  />
                  <label className="date-label">Date de naissance *</label>
                  <br />
                  <input
                    className="input date-input1"
                    type="date"
                    disabled={disableInput}
                    min="1980-01-01"
                    max="2050-12-31"
                    value={naissance}
                    onChange={(e) => setNaissance(e.target.value)}
                  />
                  <label className="lieu-label">Lieu * </label>
                  <br />
                  <input
                    className="input lieu-input1"
                    type="text"
                    disabled={disableInput}
                    value={lieu}
                    onChange={(e) => setLieu(e.target.value)}
                  />
    
                  <label className="diplome-label">Spécialité *</label>
                  <br />
                  <select
                    readOnly
                    onChange={(e) => {
                      setDiploma(e.target.value);
                      getSpecialityName();
                    }}
                    value={Diploma}
                    id="diplome-select"
                    disabled={disableInput}
                  >
                    <option value="" name="" disabled>
                      Sélectionner une option
                    </option>
                    <option name="Génie_Logiciel" value="10">
                      Génie Logiciel et système d'information
                    </option>
                    <option name="Business_Intelligence" value="11">
                      Business Intelligence
                    </option>
                  </select>
    
                  <label className="proces-label">Procès-verbal *</label>
                  <br />
    
                  <input
                    className="input proces-input"
                    type="date"
                    min="1980-01-01"
                    max="2050-12-31"
                    disabled={disableInput}
                    value={dateProces}
                    onChange={(e) => setDateProces(e.target.value)}
                  />
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
                  <label className="mention-label">Mention *</label>
                  <br />
                  <select
                    readOnly
                    onChange={(e) => setMention(e.target.value)}
                    value={mention}
                    id="mention-select"
                    name="mention"
                    disabled={disableInput}
                  >
                    <option value={""} disabled>
                      Sélectionner une option
                    </option>
                    <option value="1">Passable</option>
                    <option value="2">Assez Bien</option>
                    <option value="3">Bien</option>
                    <option value="4">Très Bien</option>
                    {/* <option value="5">Honorable</option>
                    <option value="6">Trés Honorable</option>
                    <option value="7">Trés Honorable avec félicitation</option> */}
                  </select>
                  <label className="duplicata-label-L">Duplicata</label>
                  <Checkbox
                    className="duplicata-input-L"
                    onClick={handleChangeDuplicata}
                    disabled={disableInput}
                    checked={checkedDuplicata}
                  />
                </div>
                {/* <hr className="last-line"/> */}
                <div className="buttons-container">
                  <button
                    className={enabled ? "cancel-button-disabled" : "cancel-button"}
                    type="button"
                    onClick={() => {
                      generatedata();
                      setDisableInput(true);
                    }}
                    disabled={enabled}
                  >
                    Générer QR
                  </button>
                  <button
                    className={
                      base64 ? "generate-button-disabled" : "generate-button"
                    }
                    disabled={base64 ? true : false}
                    type="button"
                    onClick={() => {
                      setShow((show) => !show);
                      modifyPdf(
                        lastName,
                        firstName,
                        id,
                        naissance,
                        lieu,
                        mention,
                        dateProces
                      );
                    }}
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
                    onClick={() => {
                      downloadPDF();
                      setEnabledCanvas(false);
                    }}
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

