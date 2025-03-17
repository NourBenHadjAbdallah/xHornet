import React, { useContext, useState, useRef, useEffect } from "react";
import "../Main/MainInterfaceStyle.css";
import refreshImage from "../../resources/refresh_blue.png";
import Loading, { NumberContext } from "../Loading/Loading.js";
import UndoIcon from "@material-ui/icons/Undo";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { Button } from "@material-ui/core";
import Login from "../Login/Login.js";
import Modal from "@material-ui/core/Modal";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import UniFormulaire from "../../components/Form/UniFormulaire.js";

const ipc = window.require("electron").ipcRenderer;

const MainInterface = ({selectedDegree, speciality}) => {
  const [base64, setBase64] = useState("");
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState("");
  const [section, setSection] = useState("");
  const [undo, setUndo] = useState(false);
  const [logOut, setLogOut] = useState(false);
  const [Diploma, setDiploma] = useState("");
  const [academicFullYear, setAcademicFullYear] = useState("");
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);





  useEffect(() => {
    const updateOnlineStatus = () => setOnlineStatus(navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  // Callback to update QR and other information from UniFormulaire
  const callback = (
    base64Data,
    loader,
    ID,
    sectionData,
    DiplomaData,
    academicFullYearData
  ) => {
    setBase64(base64Data);
    setLoading(loader);
    setId(ID);
    setSection(sectionData);
    setDiploma(DiplomaData);
    setAcademicFullYear(academicFullYearData);
  };

  const handleUndo = () => setUndo(true);

  const handleQuit = () => {
    setLogOut(true);
    setUndo(true);
  };



  const downloadImage = () => {
    const base64Icon = `data:image/png;base64,${base64}`;
    ipc.send("downloadImage", id, section, Diploma, academicFullYear,base64Icon);
  };

  const base64Icon = `data:image/png;base64,${base64}`;
  const renderOfflineModal = () => (
    <Modal
      disablePortal
      disableEnforceFocus
      disableAutoFocus
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={!onlineStatus}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          margin: "auto",
          width: "100%",
          bgcolor: "#F44336",
          border: "2px solid #F44336",
          color: "white",
          p: 2,
        }}
      >
        <Typography id="server-modal-title" variant="h6" component="h2">
          Problème Connexion
        </Typography>
        <Typography component="span">
          Veuillez vérifier votre connexion Internet
        </Typography>
      </Box>
    </Modal>
  );

  return (
    <>
      {!undo ? (
        <>
          <header className="main-header">
            <div className="react-header" />
            <div className="button-header">
              <Button
                variant="contained"
                onClick={handleUndo}
                id="precedent-button"
                startIcon={<UndoIcon />}
              >
                Précédent
              </Button>
              <Button
                variant="contained"
                id="quitter-button"
                onClick={handleQuit}
                startIcon={<ExitToAppIcon />}
              >
                Quitter
              </Button>
            </div>
            <hr className="line-header" />
          </header>

          {renderOfflineModal()}

          <UniFormulaire
            parentcallback={callback}
            selectedDegree={selectedDegree}
            speciality={speciality}
          />

          <section className="display-qr-section">
            <h3 className="form-title">Aperçu du code QR</h3>
            <hr className="first-qr-line" />
            {loading || base64 === "" ? (
              <img className="refresh-image" src={refreshImage} alt="Loading" />
            ) : (
              <img className="qr-image" src={base64Icon} alt="QR Code" />
            )}
            <div className="buttons-container">
              <button
                className={
                  loading || base64 === ""
                    ? "download-button-disabled"
                    : "download-button-enabled"
                }
                type="button"
                onClick={downloadImage}
                disabled={loading || base64 === ""}
              >
                Télécharger
              </button>
            </div>
          </section>
        </>
      ) : logOut ? (
        <Login />
      ) : (
        <Loading />
      )}
    </>
  );
};

export default MainInterface;