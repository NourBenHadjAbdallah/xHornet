import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@material-ui/core';
import CSVTable from './CSVTable';
import { processXlsxFile, validateFileType } from '../../helpers/xlsxUtils'
import '../../pages/Loading/LoadingStyle.css';

function Batch({ speciality, selectedDegree, onSubmit, onError }) {
  const [array, setArray] = useState([]);
  const [show, setShow] = useState(false);
  const [showCSVContent, setShowCSVContent] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  const handleOnChange = (e) => {
    e.preventDefault();
    const files = e.target.files;
    if (!files.length) return;

    setLoading(true);
    setError(null);
    const file = files[0];

    try {
      validateFileType(file);
      processXlsxFile(
        file,
        selectedDegree,
        (formattedRows) => {
          setArray(formattedRows);
          setSelectedRows(formattedRows);
          setShow(true);
          setLoading(false);
        },
        (errorMsg) => {
          setError(errorMsg);
          setShow(false);
          setLoading(false);
          onError(true);
        }
      );
    } catch (err) {
      setError(err.message);
      setShow(false);
      setLoading(false);
    }
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