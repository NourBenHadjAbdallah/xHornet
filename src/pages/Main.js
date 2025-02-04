import React, { useContext, useState, useRef, useEffect } from "react";
import "../css/main-interface.css";
import { Grid, Checkbox, FormControlLabel, Button, RadioGroup, Radio } from "@material-ui/core";
import refreshImage from "../resources/refresh_blue.png";
import Loading, { NumberContext } from "./Loading";
import UndoIcon from "@material-ui/icons/Undo";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import Login from "./Login";
import ExcelHandling from "./excelHandling";
import Modal from "@material-ui/core/Modal";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import UniFormulaire from "../components/UniFormulaire";
const ipc = window.require("electron").ipcRenderer;

const MainInterface = ({ props }) => {
  const [selectedDiplomaType, setSelectedDiplomaType] = useState(null);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);
  const [undo, setUndo] = useState(false);
  const [logOut, setLogOut] = useState(false);

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

  const undoConfirm = () => {
    if (selectedDiplomaType !== null) {
      setSelectedDiplomaType(null);
      setSelectedDegree(null);
    } else {
      setUndo(true);
    }
  };

  const quit = () => {
    setLogOut(true);
    setUndo(true);
  };

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

          {onlineStatus ? null : (
            <Modal
              disablePortal
              disableEnforceFocus
              disableAutoFocus
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
            </Modal>
          )}

          {selectedDiplomaType === null ? (
            <Grid container spacing={2} style={{ padding: 20 }}>
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedDiplomaType === true}
                      onChange={() => setSelectedDiplomaType(true)}
                    />
                  }
                  label="Diplôme par unité"
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedDiplomaType === false}
                      onChange={() => setSelectedDiplomaType(false)}
                    />
                  }
                  label="Diplôme par lot"
                />
              </Grid>
            </Grid>
          ) : selectedDiplomaType ? (
            <UniFormulaire />
          ) : selectedDegree === null ? (
            <Grid container spacing={2} style={{ padding: 20 }}>
              <Grid item>
                <RadioGroup
                  value={selectedDegree}
                  onChange={(e) => setSelectedDegree(e.target.value)}
                >
                  <FormControlLabel
                    value="engineering"
                    control={<Radio />}
                    label="Ingenieur"
                  />
                  <FormControlLabel
                    value="bachelors"
                    control={<Radio />}
                    label="Licence"
                  />
                </RadioGroup>
              </Grid>
            </Grid>
          ) : (
            <ExcelHandling diploma={selectedDegree} />
          )}

          {selectedDiplomaType !== null && (
            <section className="display-qr-section">
              {/* ... existing QR section content ... */}
            </section>
          )}
        </>
      ) : logOut ? (
        <Login />
      ) : (
        <ExcelHandling />
      )}
    </>
  );
};

export default MainInterface;