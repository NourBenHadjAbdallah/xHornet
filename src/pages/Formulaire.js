import React from "react";
import { useContext, forwardRef, useImperativeHandle,useState,useEffect } from "react";
import '../css/main-interface.css';
import { api } from '../api'
import configData from "../helpers/config.json";
import { xmlFake } from "../helpers/utils.js";
import { PDFDocument, rgb,StandardFonts } from 'pdf-lib';
import { NumberContext } from './Loading';
import fontkit from '@pdf-lib/fontkit';
const _ = require("lodash");
const ipc = window.require('electron').ipcRenderer;
var XMLParser = require('react-xml-parser');
const Formulaire = forwardRef((props, ref) => {
  const [error, setError] = useState(false);
  const { specialité, value, selected } = useContext(NumberContext);
  const diploma = value === '3' ? 'National Engineering diploma' : 'National Bachelor Degree';
  const diplomaFR = value === '3' ? 'ingénieur' : 'licence';
  let d = new Date()
  var date = ('0' + d.getDate()).slice(-2) + '/'
    + ('0' + (d.getMonth() + 1)).slice(-2) + '/'
    + d.getFullYear();
  var academicFullYear = (new Date().getFullYear() - 1).toString() + "-" + new Date().getFullYear().toString()
  var academicFullYearElectron = new Date().getFullYear().toString() + "-" + (new Date().getFullYear() - 1).toString()
  //click sur button imprimer dans le parent component
  useImperativeHandle(ref, () => ({
    createFolder() {
      modifyPdf()
    }
  }))
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setTimeout(() => {
    setError(false)  }, 3000);
  }, [error]);

  // const delay = ms => new Promise(
  //   resolve => setTimeout(resolve, ms)
  // );
  const getDiplome = (specialité) => {
    let diplomes = []
    if (value === '3') {
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
    }
    else {
      diplomes = ["licence_Genie_Logiciel", "licence_Business_Intelligence"];
      return diplomes[specialité - 10] + ".pdf";
    }

  };
  function getMentionEN(input) {
    var inputMap = {
      "passable": "with standard pass",
      "assez bien": "with honours",
      "bien": "with high honours",
      "trés bien": "with highest honour"
    };

    
    return inputMap[input] ;
}
console.log(ref)
function getspecialtyeEN(input) {
  var inputMap = {
    "10": "Information Systems and Software Engineering",
    "11": "Business Intelligence",
    "20": "Computer Engineering",
    "21": "Management Computer Engineering",
    "22": "Telecommunications and Networks Engineering",
    "23": "Electrical and Automatic Engineering",
    "24": "Electromechanical Engineering",
    "25": "Mechanical Engineering",
    "26": "Biotechnology Engineering",
    "27": "Civil Engineering",
  };

  
  return inputMap[input] ;
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
  const modifyPdf = async () => {
    // if (error===true) {
    //   props.onError(false);
    //  console.log("here 1")
    //  return
    // }
    const diplomeName = getDiplome(specialité);
    const url = "./assets/" + diplomeName;
   
    const specialty = getspecialtyeEN(specialité)
    
    const arrayOfSelected = _.chunk(selected, 10)
    let progress = 0
    arrayOfSelected.map(async function (element, key) {

      element.map(async function (index, key) {
        //remove space between keys
        const result = Object.fromEntries(
          Object.entries(index).map(([key, v]) => [key.split(' ').join('_'), v]))
        let image = '';
        let Mention= result.Mention ?getMentionEN(result.Mention.toLowerCase()):'';
        let hasError = false; // Variable pour vérifier si une erreur s'est produite
     
        const OptionalMention = result.Mention ? 
        `<!--Optional:-->

        <code>CD</code>

        <!--Optional:-->

        <value>${Mention}</value>` : 

        null

        const xmls = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.soap.progress.com/">

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
     
                    <value>${result.Prénom_NOM}</value>
     
                 </item>
     
                   <item>
     
                    <!--Optional:-->
     
                    <code>0K</code>
     
                    <!--Optional:-->
     
                    <value>${result.CIN}</value>
     
                 </item>
     
                    <item>
     
                    <!--Optional:-->
     
                    <code>CK</code>
     
                    <!--Optional:-->
     
                    <value> ${diploma} </value>
     
                 </item>
                 <item>
     
                 <!--Optional:-->
  
                 <code>AN</code>
  
                 <!--Optional:-->
  
                 <value> ${specialty} </value>
  
              </item>
                 <item>
     
                 <!--Optional:-->
  
                 <code>CC</code>
  
                 <!--Optional:-->
  
                 <value>${date}</value>
  
              </item>
              <item>
     
              <!--Optional:-->

              <code>CM</code>

              <!--Optional:-->

              <value>${academicFullYear}</value>

           </item>
                <item>
                ${OptionalMention}
                </item>
                  <item>
                    <!--Optional:-->
     
                    <code>CN</code>
     
                    <!--Optional:-->
     
                    <value>${result.PV}</value>
     
                 </item>
        
              </values>
     
           </ws:signatureWs>
     
        </soapenv:Body>
     
     </soapenv:Envelope>`;
        //call api
        let res = await api.post('', xmls).catch((err) => {
          console.log(err);
          setError(true);
          props.onError(true);
          
          hasError = true; // Définir la variable d'erreur sur true
        //  return;
          ///alert('Erreur lors de connexion au serveur Tuntrust, Veuillez réessayer')
        });
        // Vérifier si une erreur s'est produite et sortir de la fonction si c'est le cas
        if (hasError) {
         // console.log("here 2")
          setError(true);
          props.onError(true);
          return;
        }
        if(error===false)
        {  
          //console.log("here 3")
        var xmol = new XMLParser().parseFromString(configData.MODE === 1 ? res.data : xmlFake);
        xmol.getElementsByTagName('imageCev').map((item, i) => {
          image = item.value; return null
        })
        xmol.getElementsByTagName('message').map((item, i) => { return (item.value) !== 'Success' ? alert(item.value)&props.onError(false) : null })
        // //creation du pdf 
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
        // Load a PDFDocument from the existing PDF bytes
        const pdfDoc = await PDFDocument.load(existingPdfBytes)
        pdfDoc.registerFontkit(fontkit)
       // Embed times new roman font
        const timesNewRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        // Embed times new roman bold font
        const timesNewRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
       
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
        //Procès verbal date
   
    let monthProcesFR = toMonthNameFrenchPV(result.PV.substring(3, 5));
   
    let procesVerbal = result.PV.replace(/\//g, " ");
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
    
        // Get the first page of the document
        const pages = pdfDoc.getPages()
        const firstPage = pages[0]
        var base64Icon = `data:image/png;base64,${image}`;
        const pngImage = await pdfDoc.embedPng(base64Icon)
   
          //WRITE IN PDF
          firstPage.drawImage(pngImage, {
            x: 366,
            y:  26,
            width: pngImage.width  / 1.4,
            height: pngImage.height  / 1.4,
          });
          firstPage.drawText("Application Mobile:QrCheckMobile", {
            x: 359,
            y:  30,
            size: 8,
            font: timesNewRomanFont,
            color: rgb(0, 0, 0),
          });
          firstPage.drawText(datePermutation, {
            x: value==='3'?650:667,
            y: value==='3'?131:130.7,
            size: 14,
            font: timesNewRomanFont,
            color: rgb(0, 0, 0),
          });
  
          firstPage.drawText(result.Prénom_NOM, {
            x: 110,
            y: 178,
            size: 14,
            font: timesNewRomanBoldFont,
            color: rgb(0, 0, 0),
          });
  
          firstPage.drawText(result.date_de_naissance, {
            x: value==='3'?110: 114,
            y: value==='3'?154: 153.5,
            size: 14,
            font: timesNewRomanBoldFont,
            color: rgb(0, 0, 0),
          });
          firstPage.drawText(result.lieu_de_naissance, {
            x:  value==='3'?207:211,
            y: value==='3'? 154.5:154,
            size: 14,
        font: timesNewRomanBoldFont,
            color: rgb(0, 0, 0),
          });
  
          firstPage.drawText(result.CIN, {
            x: value==='3'?225:226,
            y: value==='3'?130.5: 130,
            size: 14,
            font: timesNewRomanBoldFont,
            color: rgb(0, 0, 0),
          });
  
          firstPage.drawText(academicFullYear, {
            x: value==='3'?369:371,
            y: value==='3'?324.5:375.5,
            size: 9,
            font: timesNewRomanFont,
            color: rgb(0, 0, 0),
          });
  
          firstPage.drawText(procesVerbal, {
            x: value==='3'?550: 547,
            y: value==='3'?324.5:375.5,
            size: 9,
            font: timesNewRomanFont,
            color: rgb(0, 0, 0),
          })
          if (value === '1') {
            firstPage.drawText(result.Mention, {
              x: 714,
              y: 212,
              size: 14,
              font: timesNewRomanBoldFont,
              color: rgb(0, 0, 0),
            })
          }
  


        const pdfBytes = await pdfDoc.save()
        props.onSubmit(((progress += 1) / selected.length) * 100)
        ipc.send('createFolder', result.CIN,diplomaFR, specialité, academicFullYearElectron,true)
        ipc.send("logFile", result.CIN, specialité, academicFullYearElectron, false)
        ipc.send('downloadPDF', result.CIN, diplomaFR,specialité, false, academicFullYearElectron, pdfBytes,true);
        }
      })
    });
  }

  return (
    <>
    </>
  )
})
export default Formulaire
