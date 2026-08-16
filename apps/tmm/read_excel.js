const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/PC/Desktop/TerraceFeri/2025 TEKNİK EKİPMAN LİSTESİ.xls');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const json = XLSX.utils.sheet_to_json(worksheet);
console.log(JSON.stringify(json.slice(0, 5), null, 2));
