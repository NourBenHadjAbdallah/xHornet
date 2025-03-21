import { read, utils } from 'xlsx';

// Expected headers for different diploma types
const EXPECTED_HEADERS = {
  '1': ['Prénom NOM', 'date de naissance', 'lieu de naissance', 'CIN', 'Mention', 'PV'], // Licence
  '3': ['Prénom NOM', 'date de naissance', 'lieu de naissance', 'CIN', 'PV'],           // Ingénieur
  '4': ['Prénom NOM', 'date de naissance', 'lieu de naissance', 'CIN', 'Mention', 'PV'], // Mastère
  '5': ['Prénom NOM', 'date de naissance', 'lieu de naissance', 'CIN', 'Mention', 'PV'], // Doctorat
};

export const formatDate = (excelDate) => {
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
      const fullYear = year.length === 2 ? `20${year}` : year;
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${fullYear}`;
    }
  }
  return excelDate; // Return as is if format is unexpected
};

export const processXlsxFile = (file, selectedDegree, onSuccess, onError) => {
  const fileReader = new FileReader();

  fileReader.onload = (event) => {
    try {
      const workbook = read(event.target.result, {
        type: 'array',
        dateNF: 'dd/mm/yyyy',
        cellDates: true,
        raw: false
      });
      const sheets = workbook.SheetNames;
      if (!sheets.length) {
        throw new Error('Aucune feuille trouvée dans le fichier');
      }

      const rows = utils.sheet_to_json(workbook.Sheets[sheets[0]], {
        dateNF: 'dd/mm/yyyy',
        raw: false
      });

      if (!rows.length) {
        throw new Error('Le fichier est vide');
      }

      // Format dates in the rows
      const formattedRows = rows.map(row => ({
        ...row,
        'date de naissance': formatDate(row['date de naissance']),
        'PV': row['PV'] ? formatDate(row['PV']) : row['PV']
      }));

      // Validate headers based on selected degree
      const headers = Object.keys(formattedRows[0]);
      const expectedHeaders = EXPECTED_HEADERS[selectedDegree] || EXPECTED_HEADERS['1']; // Default to Licence
      const isValid = JSON.stringify(headers) === JSON.stringify(expectedHeaders);

      if (isValid) {
        onSuccess(formattedRows);
      } else {
        throw new Error('Les colonnes du fichier ne correspondent pas au diplôme sélectionné');
      }
    } catch (err) {
      onError('Erreur lors du traitement du fichier : ' + err.message);
    }
  };

  fileReader.onerror = () => {
    onError('Erreur de lecture du fichier');
  };

  fileReader.readAsArrayBuffer(file);
};

export const validateFileType = (file) => {
  const extension = file.name.split('.').pop();
  if (extension !== 'xlsx') {
    throw new Error('Vérifier le type du document (XLSX requis)');
  }
  return true;
};