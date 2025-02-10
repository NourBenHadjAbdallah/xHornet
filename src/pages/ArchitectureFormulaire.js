import React from "react";
import { useState, useEffect } from "react";
import "../css/main-interface.css";
import { api } from "../api";
import { Checkbox } from "@material-ui/core";
import configData from "../helpers/config.json";
import { PDFDocument, rgb,StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import CircularProgress from "@material-ui/core/CircularProgress";
import { xmlFake } from "../helpers/utils.js";

const ipc = window.require("electron").ipcRenderer;
var XMLParser = require("react-xml-parser");
const PDFJS = window.pdfjsLib;

const ArchitectureFormulaire = ({ base64, parentcallback }) => {
  const [pdfBytes, setPdfBytes] = useState("");
  const [show, setShow] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [section] = useState("architecture");
  const [id, setId] = useState("");
  
  const [Diploma] = useState("architecture");

  const [naissance, setNaissance] = useState("");
  const [mention] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [enabledCanvas, setEnabledCanvas] = useState(true);
  const [enabledhide, setEnabledhide] = useState(false);
  const [lieu, setLieu] = useState("");
  const [pdf, setPdf] = useState("");
  const [width, setWidth] = useState(0);
  const [image, setImage] = useState("");
  const [height, setHeight] = useState(0);
  const [imageQR64, setImageQR64] = useState("");
  const [checkedDuplicata, setCheckedDuplicata] = useState(false);
  const [disableInput, setDisableInput] = useState(false);
  const [dateProces, setDateProces] = useState("");
  const [soutenancePV, setSoutenancePV] = useState("");
  var year = new Date().getFullYear().toString();
  var lastyear = (new Date().getFullYear() - 1).toString();
  let d = new Date();
  var date =
    ("0" + d.getDate()).slice(-2) +
    "/" +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    "/" +
    d.getFullYear();
  const [Year, setYear] = useState(year);
  const [LastYear, setLastYear] = useState(lastyear);
  var academicYear = LastYear.slice(-2) + "/" + Year.slice(-2);
  var academicFullYear =
    new Date().getFullYear().toString() +
    "-" +
    (new Date().getFullYear() - 1).toString();
  var conditionA =
    naissance.trim().length !== 0 &&
    lieu.trim().length !== 0 &&
    firstName.trim().length !== 0 &&
    lastName.trim().length !== 0 &&
    id.trim().length !== 0 &&
    dateProces.trim().length !== 0 &&
    soutenancePV.trim().length !== 0 &&
    Year.trim().length === 4 &&
    LastYear.trim().length === 4;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps

    if (conditionA && !enabledhide) {
      setEnabled(false);
    } else {
      setEnabled(true);
    }
  }, [academicYear,conditionA, enabledhide]);

  async function createFolder() {
    ipc.send(
      "createFolder",
      id,
      section,
      Diploma,
      academicFullYear,false
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
   // setImage("")
  }
  async function writeLog() {
    ipc.send("logFile", id, Diploma, academicFullYear, checkedDuplicata);
    // ipc.on("logFile", (event, arg) => {
    //   setGeneratedQR(arg)
    //   console.log(arg);
      
    //   });
  }
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

 
  //Reverse date to left to right date
  const reverseDateFrench = (date) => {
    let dateFR = date.replace(/-/g, "/");
    let monthFR = dateFR.substring(4, 8);
    let dayFR = dateFR.substring(8, 10);
    let yearFR = dateFR.substring(0, 4);
    return (dateFR = dayFR + monthFR + yearFR);
  };

  const handleChangeDuplicata = (event) => {
    setCheckedDuplicata(event.target.checked);
  };
 
  async function modifyPdf(
    lastName,
    firstName,
    id,
    naissance,
    lieu,
    dateProces,
    soutenancePV
  ) {
    //Procès verbal date
    let dateProcesFR = reverseDateFrench(dateProces);
    let monthProcesFR = toMonthNameFrenchPV(dateProces.substring(5, 7));
   
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
    //Procès verbal Soutenance date
    let dateProcesSoutenanceFR = reverseDateFrench(soutenancePV);
    let monthProcesSoutenanceFR = toMonthNameFrenchPV(soutenancePV.substring(5, 7));
   
    let procesVerbalSoutenance = dateProcesSoutenanceFR.replace(/-/g, " ");
    procesVerbalSoutenance =
    procesVerbalSoutenance[0] +
    procesVerbalSoutenance[1] +
      " " +
      monthProcesSoutenanceFR +
      " " +
      procesVerbalSoutenance[6] +
      procesVerbalSoutenance[7] +
      procesVerbalSoutenance[8] +
      procesVerbalSoutenance[9];  
    //Current Date French
    let month = toMonthNameFrenchPV(date.substring(3, 5));
    let datePermutation = date.replace(/\//g, " ");
    datePermutation = datePermutation[0] + datePermutation[1]
     + " " +
      month +
      " " +
      datePermutation[6] +
      datePermutation[7] +
      datePermutation[8] +
      datePermutation[9];
  
    let birthEtudiantFR = reverseDateFrench(naissance);
    const diplomeName= checkedDuplicata
    ? "architecteDuplicata.pdf"
    : "architecte.pdf";
    const url = "./assets/" + diplomeName;
    // const url = "./assets/ing_electrique.pdf";
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);
    // Embed times new roman font
    const timesNewRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    // Embed times new roman bold font
    const timesNewRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    // Get the first page of the document
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const base64Image = imageQR64;
    var base64Icon = `data:image/png;base64,${base64Image}`;
    const pngImage = await pdfDoc.embedPng(base64Icon);
    //Draw an image
    firstPage.drawImage(pngImage, {
     // x: firstPage.getWidth() / 2 - pngImage.width / 4,
     x:365,
      y: 26.4,
      width: pngImage.width / 1.4,
      height: pngImage.height / 1.4,
    });
    firstPage.drawText("Application Mobile:QrCheckMobile", {
      x: 359,
      y:  30,
      size: 8,
      font: timesNewRomanFont,
      color: rgb(0, 0, 0),
    });
    //FR
    firstPage.drawText(`${LastYear}-${Year}`, {
      x: 402,
      y: 339,
      size: 9,
      font: timesNewRomanFont,
      color: rgb(0, 0, 0),
    });
    //EN
    // firstPage.drawText(`${LastYear}-${Year}`, {
    //   x: 402,
    //   y: 346,
    //   size: 9,
    //   font: timesNewRomanFont,
    //   color: rgb(0, 0, 0),
    // });
    //FR
    firstPage.drawText(procesVerbal, {
      x: 380,
      y: 325.5,
      size: 9,
      font: timesNewRomanFont,
      color: rgb(0, 0, 0),
    });
    //FR
    firstPage.drawText(procesVerbalSoutenance, {
        x: 359,
        y: 310.5,
        size: 9,
        font: timesNewRomanFont,
        color: rgb(0, 0, 0),
      });
    //  //EN
    //  firstPage.drawText(dateProces, {
    //   x: 360,
    //   y: 332,
    //   size: 9,
    //   font: timesNewRomanFont,
    //   color: rgb(0, 0, 0),
    // });
    // // //EN
    // firstPage.drawText(soutenancePV, {
    //     x: 315,
    //     y: 316,
    //     size: 9,
    //     font: timesNewRomanFont,
    //     color: rgb(0, 0, 0),
    //   });
    firstPage.drawText(lastName + " " + firstName, {
      x: 115,
      y: 178,
      size: 14,
      font: timesNewRomanBoldFont,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(birthEtudiantFR, {
      x: 112,
      y: 154,
      size: 14,
      font: timesNewRomanBoldFont,
      color: rgb(0, 0, 0),
    });
    //FR
    firstPage.drawText(lieu, {
      x: 236,
      y: 154,
      size: 14,
      font: timesNewRomanBoldFont,
      color: rgb(0, 0, 0),
    });
      //EN
    // firstPage.drawText(lieu, {
    //   x: 240,
    //   y: 154,
    //   size: 14,
    //   font: timesNewRomanBoldFont,
    //   color: rgb(0, 0, 0),
    // });
    //FR
    firstPage.drawText(id, {
      x: 237,
      y: 130,
      size: 14,
      font: timesNewRomanBoldFont,
      color: rgb(0, 0, 0),
    });
        //EN
    // firstPage.drawText(id, {
    //   x: 195,
    //   y: 130,
    //   size: 14,
    //   font: timesNewRomanBoldFont,
    //   color: rgb(0, 0, 0),
    // });
    //FR
    firstPage.drawText(datePermutation, {
      x: 646,
      y: 131,
      size: 14,
      font: timesNewRomanFont,
      color: rgb(0, 0, 0),
    });
    //EN
    // firstPage.drawText(date, {
    //   x: 650,
    //   y: 130,
    //   size: 14,
    //   font: timesNewRomanFont,
    //   color: rgb(0, 0, 0),
    // });
    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    var _PDF_DOC = await PDFJS.getDocument({ url: blobUrl });
    setPdf(_PDF_DOC);
    setPdfBytes(pdfBytes);
  }

  async function renderPage() {

    var page = await pdf.getPage(1);
    var viewport = page.getViewport(1);
    var render_context = {
      canvasContext: document.querySelector("#pdf-canvas").getContext("2d"),
      viewport: viewport,
    };
    setWidth(viewport.width);
    setHeight(viewport.height);
    await page.render(render_context);
    var canvas = document.getElementById("pdf-canvas");
    var img = canvas.toDataURL("image/png");
    setImage(img);
  }
  useEffect(() => {
    pdf && renderPage();
    // eslint-disable-next-line
  }, [pdf, 1]);

  const reset = () => {
    setPdfBytes("");
    setPdf("");
    setCheckedDuplicata(false);
    setDisableInput(false);
    setEnabled(true);
    setEnabledCanvas(true);
    setEnabledhide(false);
    setFirstName("");
    setLastName("");
    setId("");
    setSoutenancePV("");
    setNaissance("");
    parentcallback("", false, "", "", "", "", "", "", "");
    setLastYear(lastyear);
    setYear(year);
    setLieu("");
    setDateProces("");
    setImage("");
  };
  const generatedata = () => {
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
                <value>Diplôme national d'architecture'</value>
             </item>
                <item>
                <!--Optional:-->
                <code>PN</code>
                <!--Optional:-->
                <value>${date}</value>
             </item>
           
             <item>
             <!--Optional:-->
             <code>ZX</code>
             <!--Optional:-->
             <value>${LastYear}/${Year}</value>
          </item>
          <item>
          <!--Optional:-->
          <code>E6</code>
          <!--Optional:-->
          <value>${dateProces}</value>
       </item>
       <item>
          <!--Optional:-->
          <code>EQ</code>
          <!--Optional:-->
          <value>${soutenancePV}</value>
       </item>
          </values>
       </ws:signatureWs>
    </soapenv:Body>
 </soapenv:Envelope>`;
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
                <value>National diploma of architect</value>
             </item>
                <item>
                <!--Optional:-->
                <code>CC</code>
                <!--Optional:-->
                <value>${date}</value>
             </item>
             <item>
                <!--Optional:-->
                <code>CL</code>
                <!--Optional:-->
                <value>${soutenancePV}</value>
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
  const handleChangeFirstAcademicYear = (e) => {
    setLastYear(e.target.value.toString().slice(0, 4));
    setYear((parseInt(e.target.value) + 1).toString().slice(0, 4));
  };
  const handleChangeSecondAcademicYear = (e) => {
    setLastYear((parseInt(e.target.value) - 1).toString().slice(0, 4));
    setYear(e.target.value.toString().slice(0, 4));
  };

  return (
    <>
      {show === false ? (
        <section className="form-section">
          <h3 className="form-title">Formulaire Architecture</h3>
          {/* <h3 className="form-title-generatedQR">Vous avez générer un total de :  {generatedQR} QR codes</h3> */}
          <div className="reload-icon">
            <button className="btn" onClick={reset}>
              <i className="fa fa-undo"></i>
            </button>
            <span className="tooltiptext">Reset</span>
          </div>
          <hr className="first-line" />
          <form>
            <div className="div-scroll">
              <label className="university-label">Université*</label>
              <br />
              <input
                className="input university-input"
                type="text"
                value={configData.UNIVERSITY}
                readOnly
              />
              <label className="institution-label">Établissement*</label>
              <br />
              <input
                className="input institution-input"
                type="text"
                value={configData.ETABLISSEMENT.FR}
                readOnly
              />
              <label className="firstname-label">Nom Étudiant*</label>
              <br />
              <input
                className="input firstname-input"
                type="text"
                disabled={disableInput}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                name="firstname"
              />
              <label className="lastname-label">Prénom Étudiant*</label>
              <br />
              <input
                className="input lastname-input"
                type="text"
                disabled={disableInput}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                name="lastname"
              />
              <label className="id-label">ID*</label>
              <br />
              <input
                className="input id-input"
                type="text"
                name="id"
                disabled={disableInput}
                value={id}
                onChange={(e) => setId(e.target.value)}
              />

              <label className="date-label">Date de naissance*</label>
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
              <label className="lieu-label">Lieu* </label>
              <br />
              <input
                className="input lieu-input1"
                type="text"
                disabled={disableInput}
                value={lieu}
                onChange={(e) => setLieu(e.target.value)}
              />

              <label className="soutenancePV-label">Procès-verbal Soutenance*</label>
              <br />
              <input
                className="input soutenancePV-input"
                type="date"
                min="1980-01-01"
                max="2050-12-31"
                disabled={disableInput}
                value={soutenancePV}
                onChange={(e) => setSoutenancePV(e.target.value)}
              />
              <label className="proces-label">Procès-verbal*</label>
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
              <label className="duplicata-label">Duplicata</label>
              <Checkbox
                className="duplicata-input"
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
                    dateProces,
                    soutenancePV
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
            {image && enabledCanvas? (
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
};
export default ArchitectureFormulaire;