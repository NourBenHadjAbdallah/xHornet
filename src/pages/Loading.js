import React, { useState, useRef, useEffect } from 'react';
import applicationLogo from "../resources/application_logo.png";
import algocodLogo from "../resources/powered-by.png";
import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, FormGroup, Button } from '@material-ui/core';
import MainInterface from './MainInterface';
import '../css/loading.css';

import Alert from "@material-ui/lab/Alert";
import { Checkbox } from "@material-ui/core";
//import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
// import TablePagination from "@material-ui/core/TablePagination";
import TableHead from "@material-ui/core/TableHead";
import Formulaire from './Formulaire';
import CircularStatic from '../components/Progressbar'
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import { read, utils } from 'xlsx';
import { parse, format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';


import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';

export const NumberContext = React.createContext({});
/*login.js is the component that give to user the access to the application*/
function Loading() {
  const [errorStateBatch, setErrorStateBatch] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [clickedBatch, setClickedBatch] = useState(false);
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(false)
  const [checkedBatch, setCheckedBatch] = useState(false)
  const [error, setError] = useState(false)
  const [array, setArray] = useState([]);
  //enable and disable visualiser button
  const [show, setShow] = useState(false);
  // contenu de fichier affiché (tableau)
  const [showCSVContent, setShowCSVContent] = useState(false);
  const [selected, setSelected] = useState([])
  const [print, setPrint] = useState(false)
  const [progress, setProgress] = useState(0)
  const [specialité, setSpecialité] = useState('')
  const [errorForm, setErrorForm] = useState(false);
  const [open, setOpen] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);
  const handleClose = () => {
    setOpen(true);
    setErrorForm(false)
    setPrint(false)
    
  }

  const ref = useRef();
  const fileReader = new FileReader();
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
  //time out to desmiss CircularStatic and init 
  useEffect(() => {
    if (progress === 100) {
      setChecked(false)
      setCheckedBatch(false)
      setValue('')
      setClicked(false)
      setClickedBatch(false)
      setShowCSVContent(false);
      setShow(false);
      setOpen(true);
      setErrorForm(false);
      setTimeout(() => {
        setProgress(0)
        setPrint(false)
       // setErrorForm(false);
      }, 3000);
    }
  }, [progress, print, checked, checkedBatch, value, clicked, clickedBatch, show, showCSVContent]);

  const handleMenuItemClick = (event) => {
    

    if (event.target.value === value) {
      setValue("");
      
    } else {
      
      setValue(event.target.getAttribute("value"))
      setSpecialité('')
      setShowCSVContent(false)
      setShow(false)
    }
  };
  function onSubmit(progress) {
    setProgress(progress)
  }
  function getErrorState(errorStateBatch) {
    setErrorStateBatch(errorStateBatch)
  }
  const handleOnChange = (e) => {

    e.preventDefault();
    const files =e.target.files;
        if (files.length) {
          const file = files[0];
              //verify FILE EXTENTION
          const name = file.name    
          const extension = name.split('.').pop();     
          if(extension === 'xlsx'){
               //convert xmls to json
          fileReader.onload = (event) => {
              const wb = read(event.target.result);
             
              const sheets = wb.SheetNames;

              if (sheets.length) {
               //const rows2 = utils.sheet_to_txt(wb.Sheets[sheets[0]], {dateNF:'dd/mm/yyyy;@',cellDates:true, raw: false});
               
              // var firstLine = rows2.split('\n').shift();
              const customParsingOptions = {
                // Assuming the dates are in "dd/mm/yy" format
                dateNF: 'dd/MM/yy',
                cellDates: true,
                raw: false,
                // Custom parsing function using date-fns and date-fns-tz
                cellTextToDate: function (cellValue, date1904) {
                  const parsedDate = parse(cellValue, this.dateNF, new Date());
                  const zonedDate = utcToZonedTime(parsedDate, 'Europe/London'); // Replace 'Your_Timezone' with your desired timezone
                  const formattedDate = format(zonedDate, 'dd/MM/yyyy');
                  return formattedDate;
                },
              };
              
                 const rows = utils.sheet_to_json(wb.Sheets[sheets[0]], {dateNF:'dd/mm/yyyy;@',cellDates:true, raw: false});
                //  const convertedData = rows.map((item) => {
                //   const parsedDate = parse(item.PV, 'dd/MM/yy', new Date());
                //   const formattedDate = format(parsedDate, 'dd/MM/yyyy');
                //   const parsedDateBirth = parse(item["date de naissance"], 'dd/MM/yy', new Date());
                //   const formattedDateBirth = format(parsedDateBirth, 'dd/MM/yyyy');
                //   const convertedItem = {
                //     ...item,
                //     PV: formattedDate,
                //     date_de_naissance:formattedDateBirth
                //   };
                
                //   return convertedItem;
                // });
                // console.log("selected",convertedData)
                  const docLicence =["Prénom NOM","date de naissance","lieu de naissance","CIN","Mention","PV"];
                  const docing =["Prénom NOM","date de naissance","lieu de naissance","CIN","PV"];
             //  if (((JSON.stringify(Object.keys(convertedData[0])) === JSON.stringify(docing)) && value ==="3")||(JSON.stringify(Object.keys(convertedData[0])) === JSON.stringify(docLicence) && value ==="1")) {
                if (((JSON.stringify(Object.keys(rows[0])) === JSON.stringify(docing)) && value ==="3")||(JSON.stringify(Object.keys(rows[0])) === JSON.stringify(docLicence) && value ==="1")) {

                // setArray(convertedData);
             
                //   setSelected(convertedData)
                setArray(rows);
             
                setSelected(rows)
                  setShow(true); 
                   }
                   else {

                    setShow(false) 
                    alert('Vérifier le contenu du document')
                 }
                         }
          }
          fileReader.readAsArrayBuffer(file);
         
        }else alert('Vérifier le type du document');setShow(false) 
     
    }
    if (showCSVContent) {
      setShowCSVContent(false);}

  };
  const handleOnSubmit = (e) => {
    e.preventDefault();
    setShowCSVContent(true);
  };
  const handleChange = (event) => {
    setChecked(event.target.checked)
   
    setCheckedBatch(false)
  };
  const handleChangeBatch = (event) => {
    setCheckedBatch(event.target.checked)
    setChecked(false)
  };
  const handlePrint = () => {
    setPrint(true)
    //errorForm?setPrint(false):setPrint(true)
    ref.current.createFolder()
    
  }
  const onConfirm = () => {
    if (value !== ''  &&(checked || checkedBatch)) {
      if (checked)
        setClicked(true)
      else if (checkedBatch)
        setClickedBatch(true)
       
    }
    else
      setError(true)
    //setClickedBatch(false)
  }

  // const handleChangespecialty = (event) => {
   
  //   setSpecialité(event.target.value);
 
    
  // };
  const handleFormError = (error) => {
    setErrorForm(error);
  };
  const headerKeys = Object.keys(Object.assign({}, ...array));
  const handleCheckboxClick = (event, id) => {
    event.stopPropagation();
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(array.map((n) => n));
      return;
    }
    setSelected([]);
  };
const getspecialité = () =>{
  if(value !== '2'){
  if(value === '3'){
  return (
    <Select
          labelId="demo-simple-select-label"
          id="demo-simple-selec"
          value={specialité}
          disabled= {value !==''?false:true}
          onChange={(e)=>{setSpecialité(e.target.value);setShow(false); setShowCSVContent(false)}}
          input={<OutlinedInput label="Name" />}
          MenuProps={MenuProps}
        >
     <option defaultValue="Sélectionner une option" name="" disabled>
                  Sélectionner une option
                </option>
                <option name="info" value="20">
                  Génie Informatique
                </option>
                <option name="infoG" value="21">
                  Génie Informatique de Gestion
                </option>
                <option name="telecom" value="22">
                  Génie Télécommunications et Réseaux
                </option>
                <option name="electrique" value="23">
                  Génie Electrique et Automatique
                </option>
              
                <option name="electro" value="24">
                  Génie Electromécanique
                </option>
                <option name="mecanqiue" value="25">
                  Génie Mécanique
                </option>
                <option name="biotech" value="26">
                  Génie Biotechnologique
                </option>
                <option name="civil" value="27">
                  Génie Civil
                </option>
        </Select>)}
        else return (<Select
          labelId="demo-multiple-name-label"
          id="demo-multiple-name"
          value={specialité}
          onChange={(e)=>{setSpecialité(e.target.value);setShow(false); setShowCSVContent(false)}}
          input={<OutlinedInput label="Specialité" />}
          MenuProps={MenuProps}
        ><option defaultValue="Sélectionner une option" name="" disabled>
                  Sélectionner une option
                </option>
                <option name="Génie_Logiciel" value="10">
                   Génie Logiciel et système d'information
                </option>
                <option name="Business_Intelligence" value="11">
                   Business Intelligence
                </option></Select>)

}}
const style = {
  position: 'absolute' ,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};
let conditionSpeciality = value ==="2"?true:specialité !=='';
//console.log("ErrorForm",errorForm,print,open,progress)
  return (
    <>
      {/* {print? <div id='formulaire'>
        <CircularStatic value={progress} /> </div> : null} */}
      {print&&errorForm===false? <div id='formulaire'>
        <CircularStatic value={progress} /> </div> : (print||errorForm)&&open?
          
      <Modal
        open={open}
       onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
          Erreur lors de la connexion au serveur Tuntrust. Veuillez réessayer.
          </Typography>
 
        </Box>
      </Modal>

       
      : null
        } 
     
      {!clicked ?
        <>
          {(error && !checkedBatch && !clickedBatch) && <Alert variant="filled" severity="error">Vous n'avez pas sélectionner un diplôme</Alert>}
          <section className="split left">
            {/* logos section OR csv import depending on clickedBatch value */}
            {!clickedBatch || progress === 100 ||checked || value==="2" ?
              <>
                <img className="application-logo" src={applicationLogo} alt="" />
                <img className="algocod-logo" src={algocodLogo} alt="" />
              </>
              :
              <>

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
             <h1 className="title-style-batch">Diplômes par lot</h1>
                <form>
                
                  {specialité ===''? <input
                    className="csv-file-input-hidden"
                    type={"file"}
                    disabled
                  /> :<input
                    className="csv-file-input"
                    type={"file"}
                    //id={"csvFileInput"}
                  
                    accept={".xlsx"}
                    onChange={(e)=>{handleOnChange(e)}}
                  />}
                 {showCSVContent ? <Button
                    variant="contained"
                    id={"csv-button"}
                    disabled={show&&selected.length !==0 ? false : true}
                    onClick={
                      handlePrint}>
                    {"Imprimer le contenu"}
                  </Button>:
                  <Button
                  variant="contained"
                  id={"csv-button"}
                  disabled={show ? false : true}
                  onClick={(e) => { handleOnSubmit(e) }}>
                  {"Visualiser le contenu"}
                </Button>}
                </form> 
                <br />
                {showCSVContent &&
                  <TableContainer className='table-show'>
                    <Table>
                      <TableHead>
                        <TableRow key={"header"} className='row'>
                          <TableCell>
                            {<Checkbox
                              checked={selected.length === array.length ? true : isSelected()}
                              onChange={handleSelectAllClick} />}
                          </TableCell>
                          {headerKeys.map((index,key) => (
                            <TableCell key={key} style={{ fontWeight: "bold" }}>{index}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {array.map((item, index) => (
                          <TableRow
                            key={index}
                            size={"small"}
                            role="checkbox"
                            aria-checked={selected.length === array.length ? true : isSelected(item)}
                            tabIndex={-1}
                            selected={selected.length === array.length ? true : isSelected(item)}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                onClick={(event) =>
                                  handleCheckboxClick(event, item)
                                }
                                className="selectCheckbox"
                                checked={selected.length === array.length ? true : isSelected(item)}
                              />
                            </TableCell>
                            {Object.values(item).map((val,key) => (
                              <TableCell key={key}>
                                {val}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <NumberContext.Provider value={{ specialité,value, selected }} >
                      <Formulaire ref={ref} onSubmit={onSubmit} onError={handleFormError}></Formulaire>
                    </NumberContext.Provider>
                  </TableContainer>
                }
              </>}
          </section>
          <section className="split right">
            <div className="loading-section">
              <h2 className='title-style-loading'>Générer Diplôme</h2>
              <div className='Loading-menu'>
                <FormLabel>Veuillez choisir un diplôme</FormLabel>
                <FormControl >
                  <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    id='radio-group'
                    value={value}
                  >
                    <FormControlLabel value="1" control={<Radio onClick={handleMenuItemClick} />} label="Licence" />
                    <FormControlLabel value="3" control={<Radio onClick={handleMenuItemClick} />} label="Ingénieur" />
                    <FormControlLabel value="2" control={<Radio onClick={handleMenuItemClick} />} label="Architecture" />
                  </RadioGroup>
                  {value !== ''&& value!=="2"?<FormControl defaultValue="Sélectionner une option" required sx={{ m: 1, minWidth: 120 }} size='small'>
                  <InputLabel defaultValue="Sélectionner une option" id="demo-simple-select-label">Specialité</InputLabel>
                  {getspecialité()}
                  </FormControl>:null}
                  <FormGroup row id='ckeckbox-group'>
                    <FormControlLabel
                      control={<Checkbox checked={checked} onClick={handleChange} name="Diplôme par unité" />}
                      label="Diplôme par unité"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                       disabled={value==="2"?true:false}
                       // checked={checkedBatch}
                          checked={value!=="2"?checkedBatch:false}
                          onChange={handleChangeBatch}
                          name="checkedB"
                        // color="primary"
                        />
                      }
                      label="Diplôme par lot"
                    />
                    
                  </FormGroup>
                </FormControl>
              </div>
              <Button variant="contained" id='loading-confirm-button' onClick={onConfirm} disabled={showCSVContent !=='' && (checked ||(checkedBatch && value!=="2")) && conditionSpeciality?false:true}> Confirmer </Button>
            </div>
          </section>
        </> :
    
        <NumberContext.Provider value={{value,specialité}} >
          <MainInterface></MainInterface>
        </NumberContext.Provider>
      }
    </>
  );
};
export default Loading;