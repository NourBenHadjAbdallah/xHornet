// ExcelHandling.jsx
import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@material-ui/core';
import '../css/loading.css';


export const NumberContext = React.createContext({});
const ExcelHandling = ({ diploma, onProcessComplete }) => {
  const [excelData, setExcelData] = useState([]);
  const [error, setError] = useState('');
  const [errorForm, setErrorForm] = useState(false);
  const [print, setPrint] = useState(false)
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
  
  // Define required columns based on degree type
  const columnRequirements = {
    licence: ["Prénom NOM", "date de naissance", "lieu de naissance", "CIN", "Mention", "PV"],
    ingenieur: ["Prénom NOM", "date de naissance", "lieu de naissance", "CIN", "PV"]
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const bstr = event.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Get headers from first row
        const headers = data[0];
        const requiredColumns = columnRequirements[diploma === 'engineering' ? 'ingenieur' : 'licence'];

        // Validate columns
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        const extraColumns = headers.filter(col => !requiredColumns.includes(col));

        if (missingColumns.length > 0 || extraColumns.length > 0) {
          setError(`Columns don't match requirements. Missing: ${missingColumns.join(', ')}. Extra: ${extraColumns.join(', ')}`);
          setExcelData([]);
          return;
        }

        // Remove header row and store data
        const rows = data.slice(1).filter(row => row.length > 0);
        setExcelData(rows);
        setError('');

      } catch (err) {
        setError('Error reading file. Please check the file format.');
        setExcelData([]);
      }
    };

    reader.readAsBinaryString(file);
  };
  const handlePrint = () => {
    setPrint(true)
    //errorForm?setPrint(false):setPrint(true)
    ref.current.createFolder()
    
  }

  return (
    <div style={{ padding: '20px' }}>
      <input
        className="csv-file-input-hidden" 
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        style={{ marginBottom: '20px' }}
      />

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {excelData.length > 0 && (
        <>
          <TableContainer className='table-show' component={Paper}>
            <Table>
              <TableHead>
                <TableRow className='row'>
                  {columnRequirements[diploma === 'engineering' ? 'ingenieur' : 'licence'].map((header, index) => (
                    <TableCell key={index}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {excelData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button 
            variant="contained" 
            id='loading-confirm-button'
            color="primary" 
            style={{ marginTop: '20px' }}
            onClick={() => onProcessComplete(excelData)}
          >
            Confirmer
          </Button>
        </>
      )}
    </div>
  );
};

export default ExcelHandling;