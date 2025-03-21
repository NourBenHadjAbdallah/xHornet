import React, { useState, useEffect, useRef } from 'react';
import {
  Radio, RadioGroup, FormControlLabel, FormControl, FormGroup,FormLabel, Button, Checkbox, OutlinedInput, InputLabel,
  Select, Box, Typography, Modal, MenuItem
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import applicationLogo from '../../resources/application_logo.png';
import algocodLogo from '../../resources/powered-by.png';
import MainInterface from '../Main/MainInterface';
import Formulaire from '../Formulaire';
import CircularStatic from '../../components/Progressbar';
import Batch from '../../components/Batch/Batch';
import '../Loading/LoadingStyle.css';
import { specialtyOptions } from '../../helpers/diplomaUtils.js'; 

export const NumberContext = React.createContext({});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function Loading() {
  const [setErrorStateBatch] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [clickedBatch, setClickedBatch] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState('');
  const [isDiplomaByUnit, setIsDiplomaByUnit] = useState(false);
  const [isDiplomaByBatch, setIsDiplomaByBatch] = useState(false);
  const [error, setError] = useState(false);
  const [print, setPrint] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speciality, setSpeciality] = useState('');
  const [errorForm, setErrorForm] = useState(false);
  const [open, setOpen] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);
  const formRef = useRef();

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

  useEffect(() => {
    if (progress === 100) {
      setIsDiplomaByUnit(false);
      setIsDiplomaByBatch(false);
      setSelectedDegree('');
      setClicked(false);
      setClickedBatch(false);
      setOpen(true);
      setErrorForm(false);
      setTimeout(() => {
        setProgress(0);
        setPrint(false);
      }, 3000);
    }
  }, [progress, print, isDiplomaByUnit, isDiplomaByBatch, selectedDegree, clicked, clickedBatch]);

  const handleMenuItemClick = (event) => {
    const newValue = event.target.getAttribute('value');
    setSelectedDegree((prev) => (prev === newValue ? '' : newValue));
    setSpeciality('');
  };

  const onSubmit = (progressOrRows) => {
    if (Array.isArray(progressOrRows)) {
      setPrint(true);
      if (formRef.current) formRef.current.createFolder(progressOrRows);
    } else {
      setProgress(progressOrRows);
    }
  };


  const handleDiplomaByUnitChange = (e) => {
    setIsDiplomaByUnit(e.target.checked);
    setIsDiplomaByBatch(false);
  };

  const handleDiplomaByBatchChange = (e) => {
    setIsDiplomaByBatch(e.target.checked);
    setIsDiplomaByUnit(false);
  };

  const handleFormError = (err) => {
    console.log('Form error:', err);
    setErrorForm(err);
  };

  const onConfirm = () => {
    if (selectedDegree && (isDiplomaByUnit || isDiplomaByBatch)) {
      if (isDiplomaByUnit) setClicked(true);
      else if (isDiplomaByBatch) setClickedBatch(true);
    } else {
      setError(true);
    }
  };

  const renderSpecialitySelect = () => {
    if (selectedDegree === '2') return null;
    const options = specialtyOptions[selectedDegree];
    if (!options) return null;

    return (
      <Select
        labelId="speciality-select-label"
        id="speciality-select"
        value={speciality}
        disabled={!selectedDegree}
        onChange={(e) => setSpeciality(e.target.value)}
        input={<OutlinedInput label="Specialité" />}
        MenuProps={MenuProps}
      >
        <MenuItem value="" disabled>
          Sélectionner une option
        </MenuItem>
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.labelFR} 
          </MenuItem>
        ))}
      </Select>
    );
  };

  const conditionSpeciality = selectedDegree === '2' ? true : speciality !== '';

  return (
    <>
      {print && !errorForm ? (
        <div id="formulaire">
          <CircularStatic value={progress} />
        </div>
      ) : (print || errorForm) && open ? (
        <Modal
          open={open}
          onClose={() => {
            setOpen(true);
            setErrorForm(false);
            setPrint(false);
          }}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Erreur lors de la connexion au serveur Tuntrust. Veuillez réessayer.
            </Typography>
          </Box>
        </Modal>
      ) : null}

      {!clicked ? (
        <>
          {error && !isDiplomaByBatch && !clickedBatch && (
            <Alert variant="filled" severity="error">
              Vous n'avez pas sélectionner un diplôme
            </Alert>
          )}
          <section className="split left">
            {(!clickedBatch || progress === 100 || isDiplomaByUnit || selectedDegree === '2') ? (
              <>
                <img className="application-logo" src={applicationLogo} alt="Application Logo" />
                <img className="algocod-logo" src={algocodLogo} alt="Algocod Logo" />
              </>
            ) : (
              <>
                {!onlineStatus && (
                  <Modal
                    open
                    disablePortal
                    disableEnforceFocus
                    disableAutoFocus
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Box
                      sx={{
                        margin: 'auto',
                        width: '100%',
                        bgcolor: '#F44336',
                        border: '2px solid #F44336',
                        color: 'white',
                      }}
                    >
                      <Typography variant="h6" component="h2">
                        Problème Connexion
                      </Typography>
                      <Typography>Veuillez vérifier votre connexion Internet</Typography>
                    </Box>
                  </Modal>
                )}
                <Batch
                  speciality={speciality}
                  selectedDegree={selectedDegree}
                  onSubmit={onSubmit}
                  onError={handleFormError}
                />
                <Formulaire
                  ref={formRef}
                  onSubmit={onSubmit}
                  onError={handleFormError}
                  selectedDegree={selectedDegree}
                  speciality={speciality}
                />
              </>
            )}
          </section>
          <section className="split right">
            <div className="loading-section">
              <h2 className="title-style-loading">Générer Diplôme</h2>
              <div className="Loading-menu">
                <FormLabel>Veuillez choisir un diplôme</FormLabel>
                <FormControl>
                  <RadioGroup
                    row
                    aria-labelledby="radio-buttons-group-label"
                    name="degree"
                    id="radio-group"
                    value={selectedDegree}
                  >
                    <FormControlLabel value="1" control={<Radio onClick={handleMenuItemClick} />} label="Licence" />
                    <FormControlLabel value="3" control={<Radio onClick={handleMenuItemClick} />} label="Ingénieur" />
                    <FormControlLabel value="2" control={<Radio onClick={handleMenuItemClick} />} label="Architecture" />
                    <FormControlLabel value="4" control={<Radio onClick={handleMenuItemClick} />} label="Mastère" />
                    <FormControlLabel value="5" control={<Radio onClick={handleMenuItemClick} />} label="Doctorat" />
                  </RadioGroup>
                  {selectedDegree !== '' && selectedDegree !== '2' && (
                    <FormControl required sx={{ m: 1, minWidth: 120 }} size="small">
                      <InputLabel id="speciality-select-label">Specialité</InputLabel>
                      {renderSpecialitySelect()}
                    </FormControl>
                  )}
                  <FormGroup row id="checkbox-group">
                    <FormControlLabel
                      control={<Checkbox checked={isDiplomaByUnit} onChange={handleDiplomaByUnitChange} name="diplomaByUnit" />}
                      label="Diplôme par unité"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          disabled={selectedDegree === '2'}
                          checked={selectedDegree !== '2' ? isDiplomaByBatch : false}
                          onChange={handleDiplomaByBatchChange}
                          name="diplomaByBatch"
                        />
                      }
                      label="Diplôme par lot"
                    />
                  </FormGroup>
                </FormControl>
              </div>
              <Button
                variant="contained"
                id="loading-confirm-button"
                onClick={onConfirm}
                disabled={!((isDiplomaByUnit || (isDiplomaByBatch && selectedDegree !== '2')) && conditionSpeciality)}
              >
                Confirmer
              </Button>
            </div>
          </section>
        </>
      ) : (
        <MainInterface selectedDegree={selectedDegree} speciality={speciality} />
      )}
    </>
  );
}

export default Loading;