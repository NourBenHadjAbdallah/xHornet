import React, { useState, useEffect } from "react";
import "../css/main-interface.css";
import {
  Grid,
  Button,
  RadioGroup,
  Radio,
  FormControl,
  FormControlLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Modal,FormLabel
} from "@material-ui/core";
import UndoIcon from "@material-ui/icons/Undo";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import Login from "./Login";
import UniFormulaire from "../components/Form/UniFormulaire.js";
import Formulaire from "./Formulaire.js"; // New import for the "lot" method

const MainInterface = () => {
  const [selectedDiploma, setSelectedDiploma] = useState(null);
  const [selectedSpeciality, setSelectedSpeciality] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [clickedBatch, setClickedBatch] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [checked, setChecked] = useState(false)
  const [checkedBatch, setCheckedBatch] = useState(false)
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);
  const [confirmed, setConfirmed] = useState(false);
  const [logOut, setLogOut] = useState(false);
  const [undo, setUndo] = useState(false);
  const [errorForm, setErrorForm] = useState(false);
  const [error, setError] = useState(false)

  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const undoConfirm = () => {
    setUndo(true);
  };

  const quit = () => {
    setLogOut(true);
    setUndo(true);
  };

  const handleFormError = (error) => {
    setErrorForm(error);
  };

  const handleConfirm = () => {
    if (selectedDiploma && (selectedDiploma === "Architecture" || selectedSpeciality) && selectedMethod !== null) {
      setConfirmed(true);
    }
  };

  const onConfirm = () => {
    if (selectedDiploma !== ''  &&(checked || checkedBatch)) {
      if (checked)
        setClicked(true)
      else if (checkedBatch)
        setClickedBatch(true)
       
    }
    else
      setError(true)
    //setClickedBatch(false)
  }

  const specialityOptions = {
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

  // If the user has confirmed, display the appropriate form
  if (confirmed) {
    if (selectedMethod === "unite") {
      return (
        <UniFormulaire diploma={selectedDiploma} speciality={selectedSpeciality} />
      );
    } else if (selectedMethod === "lot") {
      return (
        <Formulaire diploma={selectedDiploma} speciality={selectedSpeciality} />
      );
    }
  }

  // Handle logout navigation
  if (logOut) {
    return <Login />;
  }

  return (
    <>
      {/* Header with undo and quit buttons */}
      {!undo && (
        
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

          {/* Modal for offline status */}
          {!onlineStatus && (
            <Modal
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
                  padding: 2,
                }}
              >
                <Typography id="server-modal-title" variant="h6" component="h2">
                  Problème de Connexion
                </Typography>
                <Typography component="span">
                  Veuillez vérifier votre connexion Internet
                </Typography>
              </Box>
            </Modal>
          )}


          <h2 >Générer Diplôme</h2>
            <div className='Loading-menu'>
            <FormLabel>Veuillez choisir un diplôme</FormLabel>

          <Grid container spacing={2} style={{ padding: 20 }}>
            {/* Diploma selection */}
            <Grid item xs={12}>

              <FormControl component="fieldset">
                <RadioGroup
                  value={selectedDiploma}
                  onChange={(e) => {
                    setSelectedDiploma(e.target.value);
                    // Reset speciality if the diploma changes
                    setSelectedSpeciality("");
                  }}
                >
                  <FormControlLabel value="Engineering" control={<Radio />} label="Ingénieur" />
                  <FormControlLabel value="Bachelors" control={<Radio />} label="Licence" />
                  <FormControlLabel value="Architecture" control={<Radio />} label="Architecture" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Speciality selection: only for diplomas that require it */}
            {selectedDiploma && selectedDiploma !== "Architecture" && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Select
                    value={selectedSpeciality}
                    onChange={(e) => setSelectedSpeciality(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Choisissez une spécialité
                    </MenuItem>
                    {specialityOptions[selectedDiploma]?.map((speciality) => (
                      <MenuItem key={speciality} value={speciality}>
                        {speciality}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Method selection: displayed if either Architecture is chosen or a speciality is selected */}
            {selectedDiploma && (selectedDiploma === "Architecture" || selectedSpeciality) && (
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <RadioGroup value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)}>
                    <FormControlLabel value="unite" control={<Radio />} label="Diplôme par unité" />
                    <FormControlLabel value="lot" control={<Radio />} label="Diplôme par lot" />
                  </RadioGroup>
                </FormControl>
              </Grid>
            )}

            {/* Confirm button appears when a method is selected */}
            {selectedMethod && (
              <Grid item xs={12}>
                <Button variant="contained" id='loading-confirm-button' onClick={onConfirm}>
                  Confirmer
                </Button>
              </Grid>
            )}
          </Grid>
          </div>
        </>
      )}
    </>
  );
};

export default MainInterface;
