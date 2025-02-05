import React, { useContext } from "react";
/*import css file*/
import "../css/main-interface.css";
/*Import Component */
import { useState, useRef,useEffect } from "react";
import refreshImage from "../resources/refresh_blue.png";
import Loading, { NumberContext } from "./Loading";
import IngFormulaire from "./IngFormulaire";
import LicenceFormulaire from "./LicenceFormulaire";
import ArchitectureFormulaire from "./ArchitectureFormulaire";
import UndoIcon from "@material-ui/icons/Undo";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { Button } from "@material-ui/core";
import Login from "./Login";
import Modal from "@material-ui/core/Modal";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
const ipc = window.require("electron").ipcRenderer;

const MainInterface = ({ props }) => {
  const [base64, setbase64] = useState("");
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState("");
  const [section,setSection] = useState("");
  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");
  // const [mention, setMention] = useState("");
  // const [naissance, setNaissance] = useState("");
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);

  const [undo, setUndo] = useState(false);
  const [logOut, setLogOut] = useState(false);
  const [Diploma, setDiploma] = useState("");
  const [academicFullYear, setAcademicFullYear] = useState("");
  const value = useContext(NumberContext);

  const ref = useRef(null);
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const callback = (
    base64,
    loader,
    ID,
    firstName,
    lastName,
    section,
    mention,
    naissance,
    Diploma,
    academicFullYear
  ) => {
    setbase64(base64);
    setLoading(loader);
    setId(ID);
    setSection(section);
    // setFirstName(firstName);
    // setLastName(lastName);
    // setLastName(lastName);
    // setMention(mention);
    // setNaissance(naissance);
    setDiploma(Diploma);
    setAcademicFullYear(academicFullYear);
  };


  const undoConfirm = () => {
    setUndo(true);
  };
  const quit = () => {
    setLogOut(true);
    setUndo(true);
  };
  async function downloadImage() {
   
    var base64Icon = `data:image/png;base64,${base64}`;
    ipc.send("downloadImage", id,section,Diploma, academicFullYear, base64Icon);
   
  }

  var base64Icon = `data:image/png;base64,${base64}`;

  return (
    <>
      {!undo ? (
        <>
        
          <header className="main-header">
            <div className="rect-header" />

            <div className="button-header">
              <Button
                variant="contained"
                onClick={undoConfirm}
                id="precedent-button"
                startIcon={<UndoIcon />}
              >
                Précédent
              </Button>
              <Button
                variant="contained"
                id="quitter-button"
                onClick={quit}
                startIcon={<ExitToAppIcon />}
              >
                Quitter
              </Button>
            </div>

            <hr className="line-header" />
          </header>
          {onlineStatus ?null: <Modal
              disablePortal
              disableEnforceFocus
              disableAutoFocus
              aria-labelledby="simple-modal-title"
              aria-describedby="simple-modal-description"
              open
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  marginLeft: "auto",
                  marginRight: "auto",
                  width: "100%",
                  bgcolor: "#F44336",
                  border: "2px solid #F44336",
                  color: "white",
                }}
              >
                <Typography id="server-modal-title" variant="h6" component="h2">
                  Problème Connexion
                </Typography>
                <Typography component="span">
                  Veuillez vérifier votre connexion Internet
                </Typography>
              </Box>
            </Modal>}
          {value.value === "1" ? (
            <LicenceFormulaire
              parentcallback={callback}
              base64={loading || base64 === ""}
              specialityDiploma={value.specialité}
            />
          ) 
          : value.value === "2" ? (
            <ArchitectureFormulaire
              parentcallback={callback}
              base64={loading || base64 === ""}
            />
          ) 
       
          :  (
            <IngFormulaire
              parentcallback={callback}
              base64={loading || base64 === ""}
              specialityDiploma={value.specialité}
            />
          ) 
          
        }
          <section className="display-qr-section">
            <h3 className="form-title">Aperçu du code QR</h3>
            <hr className="first-qr-line" />
            {/* here where we will set a condition of api response */}
            {loading || base64 === "" ? (
              <img className="refresh-image" src={refreshImage} alt={""} />
            ) : (
              <img className="qr-image" ref={ref} src={base64Icon} alt={""} />
            )}

            <div className="buttons-container">
              <button
                className={
                  loading || base64 === ""
                    ? "download-button-disabled"
                    : "download-button-enabled"
                }
                type="submit"
                onClick={downloadImage}
              >
                Télécharger
              </button>
            </div>
          </section>
        </>
      ) : logOut ? (
        <Login />
      ) : (
        <Loading></Loading>
      )}
    </>
  );
};

export default MainInterface;
