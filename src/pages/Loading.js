import React, { useState, useRef, useEffect } from 'react';
import {Radio,RadioGroup,FormControlLabel,FormControl,FormLabel,FormGroup,Button,Checkbox,TableContainer,TableRow,Table,TableCell,TableBody,TableHead,OutlinedInput,InputLabel,Select,Box,Typography,Modal,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { read, utils } from 'xlsx';
import { parse, format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import applicationLogo from '../resources/application_logo.png';
import algocodLogo from '../resources/powered-by.png';
import MainInterface from './MainInterface';
import Formulaire from './Formulaire';
import CircularStatic from '../components/Progressbar';
import '../css/loading.css';

export const NumberContext = React.createContext({});

// Define specialty options in a constant
const SPECIALITY_OPTIONS = {
  '3': [
    { value: '20', label: 'Génie Informatique' },
    { value: '21', label: 'Génie Informatique de Gestion' },
    { value: '22', label: 'Génie Télécommunications et Réseaux' },
    { value: '23', label: 'Génie Electrique et Automatique' },
    { value: '24', label: 'Génie Electromécanique' },
    { value: '25', label: 'Génie Mécanique' },
    { value: '26', label: 'Génie Biotechnologique' },
    { value: '27', label: 'Génie Civil' },
  ],
  '1': [
    { value: '10', label: 'Génie Logiciel et système d\'information' },
    { value: '11', label: 'Business Intelligence' },
  ],
};

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
  const [errorStateBatch, setErrorStateBatch] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [clickedBatch, setClickedBatch] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState('');
  const [isDiplomaByUnit, setIsDiplomaByUnit] = useState(false);
  const [isDiplomaByBatch, setIsDiplomaByBatch] = useState(false);
  const [error, setError] = useState(false);
  const [array, setArray] = useState([]);
  const [show, setShow] = useState(false);
  const [showCSVContent, setShowCSVContent] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [print, setPrint] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speciality, setSpeciality] = useState('');
  const [errorForm, setErrorForm] = useState(false);
  const [open, setOpen] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);

  const fileReader = useRef(new FileReader());
  const formRef = useRef();

  // online/offline status
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

  // Reset state when progress reaches 100
  useEffect(() => {
    if (progress === 100) {
      setIsDiplomaByUnit(false);
      setIsDiplomaByBatch(false);
      setSelectedDegree('');
      setClicked(false);
      setClickedBatch(false);
      setShowCSVContent(false);
      setShow(false);
      setOpen(true);
      setErrorForm(false);
      setTimeout(() => {
        setProgress(0);
        setPrint(false);
      }, 3000);
    }
  }, [progress, print, isDiplomaByUnit, isDiplomaByBatch, selectedDegree, clicked, clickedBatch, show, showCSVContent]);


  const handleMenuItemClick = (event) => {
    const newValue = event.target.getAttribute('value');
    setSelectedDegree((prev) => (prev === newValue ? '' : newValue));
    setSpeciality('');
    setShow(false);
    setShowCSVContent(false);
  };

  function onSubmit(progress) {
    setProgress(progress)
  }
  function getErrorState(errorStateBatch) {
    setErrorStateBatch(errorStateBatch)
  }

  const handleOnChange = (e) => {
    e.preventDefault();
    const files = e.target.files;
    if (!files.length) return;

    const file = files[0];
    const extension = file.name.split('.').pop();
    if (extension !== 'xlsx') {
      alert('Vérifier le type du document');
      setShow(false);
      return;
    }

    fileReader.current.onload = (event) => {
      const workbook = read(event.target.result);
      const sheets = workbook.SheetNames;
      if (!sheets.length) return;

      const rows = utils.sheet_to_json(workbook.Sheets[sheets[0]], {
        dateNF: 'dd/mm/yyyy;@',
        cellDates: true,
        raw: false,
      });

      // Expected headers for validation
      const headersForLicence = [
        'Prénom NOM',
        'date de naissance',
        'lieu de naissance',
        'CIN',
        'Mention',
        'PV',
      ];
      const headersForEngineer = [
        'Prénom NOM',
        'date de naissance',
        'lieu de naissance',
        'CIN',
        'PV',
      ];

      const headers = Object.keys(rows[0] || {});
      const isValid =
        (selectedDegree === '3' &&
          JSON.stringify(headers) === JSON.stringify(headersForEngineer)) ||
        (selectedDegree === '1' &&
          JSON.stringify(headers) === JSON.stringify(headersForLicence));

      if (isValid) {
        setArray(rows);
        setSelectedRows(rows);
        setShow(true);
      } else {
        setShow(false);
        alert('Vérifier le contenu du document');
      }
    };
    fileReader.current.readAsArrayBuffer(file);
    if (showCSVContent) setShowCSVContent(false);
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    setShowCSVContent(true);
  };

  const handleDiplomaByUnitChange = (e) => {
    setIsDiplomaByUnit(e.target.checked);
    setIsDiplomaByBatch(false);
  };

  const handleDiplomaByBatchChange = (e) => {
    setIsDiplomaByBatch(e.target.checked);
    setIsDiplomaByUnit(false);
  };

  const handlePrint = () => {
    setPrint(true);
    if (formRef.current) formRef.current.createFolder();
  };

  const onConfirm = () => {
    if (selectedDegree && (isDiplomaByUnit || isDiplomaByBatch)) {
      if (isDiplomaByUnit) setClicked(true);
      else if (isDiplomaByBatch) setClickedBatch(true);
    } else {
      setError(true);
    }
  };

  const handleFormError = (err) => setErrorForm(err);

  const headerKeys = Object.keys(array[0] || {});

  const handleCheckboxClick = (event, row) => {
    event.stopPropagation();
    setSelectedRows((prevSelected) => {
      const index = prevSelected.indexOf(row);
      if (index === -1) {
        return [...prevSelected, row];
      } else {
        return prevSelected.filter((_, i) => i !== index);
      }
    });
  };

  const isSelected = (row) => selectedRows.indexOf(row) !== -1;

  const handleSelectAllClick = (event) => {
    setSelectedRows(event.target.checked ? [...array] : []);
  };

  // Render the speciality select using the constant options
  const renderSpecialitySelect = () => {
    if (selectedDegree === '2') return null;
    const options = SPECIALITY_OPTIONS[selectedDegree];
    if (!options) return null;

    return (
      <Select
        labelId="speciality-select-label"
        id="speciality-select"
        value={speciality}
        disabled={!selectedDegree}
        onChange={(e) => {
          setSpeciality(e.target.value);
          setShow(false);
          setShowCSVContent(false);
        }}
        input={<OutlinedInput label="Specialité" />}
        MenuProps={MenuProps}
      >
        <option value="" disabled>
          Sélectionner une option
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    );
  };

  // Condition to enable the "Confirmer" button
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
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
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
                      <Typography>
                        Veuillez vérifier votre connexion Internet
                      </Typography>
                    </Box>
                  </Modal>
                )}
                <h1 className="title-style-batch">Diplômes par lot</h1>
                <form>
                  {speciality === '' ? (
                    <input className="csv-file-input-hidden" type="file" disabled />
                  ) : (
                    <input
                      className="csv-file-input"
                      type="file"
                      accept=".xlsx"
                      onChange={handleOnChange}
                    />
                  )}
                  {showCSVContent ? (
                    <Button
                      variant="contained"
                      id="csv-button"
                      disabled={show && selectedRows.length !== 0 ? false : true}
                      onClick={handlePrint}
                    >
                      Imprimer le contenu
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      id="csv-button"
                      disabled={!show}
                      onClick={handleOnSubmit}
                    >
                      Visualiser le contenu
                    </Button>
                  )}
                </form>
                <br />
                {showCSVContent && (
                  <TableContainer className="table-show">
                    <Table>
                      <TableHead>
                        <TableRow key="header" className="row">
                          <TableCell>
                            <Checkbox
                              checked={selectedRows.length === array.length}
                              onChange={handleSelectAllClick}
                            />
                          </TableCell>
                          {headerKeys.map((key, index) => (
                            <TableCell key={index} style={{ fontWeight: 'bold' }}>
                              {key}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {array.map((item, index) => (
                          <TableRow
                            key={index}
                            size="small"
                            role="checkbox"
                            aria-checked={isSelected(item)}
                            tabIndex={-1}
                            selected={isSelected(item)}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox onClick={(event) => handleCheckboxClick(event, item)} checked={isSelected(item)} />
                            </TableCell>
                            {Object.values(item).map((val, idx) => (
                              <TableCell key={idx}>{val}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <NumberContext.Provider value={{ speciality, selectedDegree, selectedRows }}>
                      <Formulaire ref={formRef} onSubmit={onSubmit} onError={handleFormError} />
                    </NumberContext.Provider>
                  </TableContainer>
                )}
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
                disabled={
                  !(
                    showCSVContent !=='' &&
                    (isDiplomaByUnit || (isDiplomaByBatch && selectedDegree !== '2')) &&
                    conditionSpeciality
                  )
                }
              >
                Confirmer
              </Button>
            </div>
          </section>
        </>
      ) : (
        <NumberContext.Provider value={{ selectedDegree, speciality }}>
          <MainInterface/>
        </NumberContext.Provider>
      )}
    </>
  );
}

export default Loading;
