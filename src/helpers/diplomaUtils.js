import configData from "../helpers/config.json"; 

export const diplomaOptions = {
  "1": { value: "Licence", label: "Licence" },
  "3": { value: "Ingénieur", label: "Ingénieur" },
  "2": { value: "Architecture", label: "Architecture" },
  "4": { value: "Mastère", label: "Mastère" },
  "5": { value: "Doctorat", label: "Doctorat" },
};

// Centralized specialty options with both French and English labels
export const specialtyOptions = {
  "1": [
    { value: "10", labelFR: "Génie Logiciel et système d'information", labelEN: "Information Systems and Software Engineering" },
    { value: "11", labelFR: "Business Intelligence", labelEN: "Business Intelligence" },
  ],
  "3": [
    { value: "20", labelFR: "Génie Informatique", labelEN: "Computer Engineering" },
    { value: "21", labelFR: "Génie Informatique de Gestion", labelEN: "Management Computer Engineering" },
    { value: "22", labelFR: "Génie Télécommunications et Réseaux", labelEN: "Telecommunications and Networks Engineering" },
    { value: "23", labelFR: "Génie Electrique et Automatique", labelEN: "Electrical and Automatic Engineering" },
    { value: "24", labelFR: "Génie Electromécanique", labelEN: "Electromechanical Engineering" },
    { value: "25", labelFR: "Génie Mécanique", labelEN: "Mechanical Engineering" },
    { value: "26", labelFR: "Génie Biotechnologique", labelEN: "Biotechnology Engineering" },
    { value: "27", labelFR: "Génie Civil", labelEN: "Civil Engineering" },
  ],
  "4": [
    {value: "30", labelFR: "Business Intelligence et Big Data", labelEN: "Business Intelligence and Big Data"},
    {value: "31", labelFR: "Intelligence Artificielle et Science des Données", labelEN: "Artificial Intelligence and Data Science"},
  ],
  "5": [
    { value: "40", labelFR: "Génie Informatique", labelEN: "Computer Engineering"},
    { value: "41", labelFR: "Génie Logiciel et système d'information", labelEN: "Information Systems and Software Engineering" },
    { value: "42", labelFR: "Génie Informatique de Gestion", labelEN: "Management Computer Engineering" },
  ]
};

// Derived mappings for backward compatibility
export const specialtiesMapping = Object.fromEntries(
  Object.entries(specialtyOptions).flatMap(([degree, options]) =>
    options.map(opt => [opt.value, opt.labelFR])
  )
);

export const specialtiesMappingEN = Object.fromEntries(
  Object.entries(specialtyOptions).flatMap(([degree, options]) =>
    options.map(opt => [opt.value, opt.labelEN])
  )
);

export const specialtieOptions = {
  Ingénieur: specialtyOptions["3"].map(opt => opt.labelFR),
  Licence: specialtyOptions["1"].map(opt => opt.labelFR),
  Mastère: specialtyOptions["4"].map(opt => opt.labelFR),
  Doctorat: specialtyOptions["5"].map(opt => opt.labelFR),
};

export const mentionOptions = [
  { value: "Passable", label: "Passable" },
  { value: "Assez Bien", label: "Assez Bien" },
  { value: "Bien", label: "Bien" },
  { value: "Très Bien", label: "Très Bien" },
];

export const mentionMappingEN = {
  "passable": "with standard pass",
  "assez bien": "with honours",
  "bien": "with high honours",
  "très bien": "with highest honour",
};

export const getDiplomaFile = (speciality, selectedDegree, isDuplicata = false) => {
  const diplomaType = diplomaOptions[selectedDegree]?.value || '';
  if (!diplomaType || !configData.DIPLOMAS[diplomaType]) return '';

  const diplomaConfig = configData.DIPLOMAS[diplomaType];
  const fileList = isDuplicata ? diplomaConfig.duplicata : diplomaConfig.normal;

  // Map speciality to index based on degree
  const indexMap = {
    '1': speciality - 10, // Licence
    '3': speciality - 20, // Ingénieur
    '4': speciality - 30, // Mastère
    '5': speciality - 40, // Doctorat
    '2': 0,               // Architecture (always 0 since only one file)
  };
  const index = indexMap[selectedDegree] ?? -1;

  return fileList[index] ? `${fileList[index]}.pdf` : '';
};

export const getAcademicYears = () => {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  return `${currentYear}-${previousYear}`;
};

export const formatDateFrench = (date) => {
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const toMonthNameFrenchPV = (month) => {
  const inputMapMonths = {
    "01": "Janvier", "02": "Février", "03": "Mars", "04": "Avril", "05": "Mai",
    "06": "Juin", "07": "Juillet", "08": "Août", "09": "Septembre", "10": "Octobre",
    "11": "Novembre", "12": "Décembre"
  };
  return inputMapMonths[month] || '';
};