import React, { useContext } from 'react'
import { NumberContext } from './Loading';


function PdfHendling({diplome}) {
    const { specialité, value, selected } = useContext(NumberContext);
    const diplomaFR = value === '3' ? 'ingénieur' : 'licence';
    const getDiplome = (diplome) => {
        let diplomes = []
        if (value === 'Ingénieur') {
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
    }
  return (
    <div>PdfHendling</div>
  )
}

export default PdfHendling