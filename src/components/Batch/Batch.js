import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@material-ui/core';
import { read, utils } from 'xlsx';
import CSVTable from './CSVTable';
import '../../pages/Loading/LoadingStyle.css';

function Batch({ speciality, selectedDegree, onSubmit, onError }) {
  const [array, setArray] = useState([]);
  const [show, setShow] = useState(false);
  const [showCSVContent, setShowCSVContent] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileReader = useRef(new FileReader());
  const fileInputRef = useRef(null);

  useEffect(() => {
    setArray([]);
    setShow(false);
    setShowCSVContent(false);
    setSelectedRows([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedDegree, speciality]);

  const formatDate = (excelDate) => {
    // If it's already a Date object
    if (excelDate instanceof Date) {
      const day = String(excelDate.getDate()).padStart(2, '0');
      const month = String(excelDate.getMonth() + 1).padStart(2, '0');
      const year = excelDate.getFullYear();
      return `${day}/${month}/${year}`;
    }
    // If it's a string that needs parsing
    if (typeof excelDate === 'string') {
      const parts = excelDate.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        // Handle two-digit year
        const fullYear = year.length === 2 ? `20${year}` : year;
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${fullYear}`;
      }
    }
    return excelDate; // Return as is if format is unexpected
  };

  const handleOnChange = (e) => {
    e.preventDefault();
    const files = e.target.files;
    if (!files.length) return;

    setLoading(true);
    setError(null);
    const file = files[0];
    const extension = file.name.split('.').pop();
    if (extension !== 'xlsx') {
      setError('Vérifier le type du document (XLSX requis)');
      setShow(false);
      setLoading(false);
      return;
    }

    fileReader.current.onload = (event) => {
      try {
        const workbook = read(event.target.result, {
          type: 'array',
          dateNF: 'dd/mm/yyyy', // Specify the date format we expect
          cellDates: true,     // Ensure dates are parsed as Date objects
          raw: false           // Process the values instead of using raw data
        });
        const sheets = workbook.SheetNames;
        if (!sheets.length) {
          setError('Aucune feuille trouvée dans le fichier');
          setLoading(false);
          return;
        }

        const rows = utils.sheet_to_json(workbook.Sheets[sheets[0]], {
          dateNF: 'dd/mm/yyyy', // Enforce date format
          raw: false
        });

        if (!rows.length) {
          setError('Le fichier est vide');
          setShow(false);
          setLoading(false);
          return;
        }

        // Process the rows to ensure correct date formatting
        const formattedRows = rows.map(row => ({
          ...row,
          'date de naissance': formatDate(row['date de naissance']),
          'PV': row['PV'] ? formatDate(row['PV']) : row['PV']
        }));

        const headersForLicence = ['Prénom NOM', 'date de naissance', 'lieu de naissance', 'CIN', 'Mention', 'PV'];
        const headersForEngineer = ['Prénom NOM', 'date de naissance', 'lieu de naissance', 'CIN', 'PV'];
        const headers = Object.keys(formattedRows[0]);
        const isValid =
          (selectedDegree === '3' && JSON.stringify(headers) === JSON.stringify(headersForEngineer)) ||
          (selectedDegree === '1' && JSON.stringify(headers) === JSON.stringify(headersForLicence));

        if (isValid) {
          setArray(formattedRows);
          setSelectedRows(formattedRows);
          setShow(true);
        } else {
          setError('Les colonnes du fichier ne correspondent pas au diplôme sélectionné');
          setShow(false);
        }
      } catch (err) {
        setError('Erreur lors du traitement du fichier : ' + err.message);
        onError(true);
      } finally {
        setLoading(false);
      }
    };

    fileReader.current.onerror = () => {
      setError('Erreur de lecture du fichier');
      onError(true);
      setLoading(false);
    };

    fileReader.current.readAsArrayBuffer(file);
    if (showCSVContent) setShowCSVContent(false);
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    setShowCSVContent(true);
  };

  return (
    <>
      <h1 className="title-style-batch">Diplômes par lot</h1>
      <form>
        {speciality === '' ? (
          <input className="csv-file-input-hidden" type="file" disabled />
        ) : (
          <input
            ref={fileInputRef}
            className="csv-file-input"
            type="file"
            accept=".xlsx"
            onChange={handleOnChange}
            disabled={loading}
          />
        )}
        {loading ? (
          <div className="batch-error-message">Chargement...</div>
        ) : error ? (
          <div className="batch-error-message">{error}</div>
        ) : showCSVContent ? (
          <Button
            variant="contained"
            id="csv-button"
            disabled={!show || selectedRows.length === 0}
            onClick={() => onSubmit(selectedRows)}
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
        array.length ? (
          <CSVTable
            data={array}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
          />
        ) : (
          <div>Aucune donnée à afficher</div>
        )
      )}
    </>
  );
}

export default Batch;