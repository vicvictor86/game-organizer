import Excel from 'exceljs';
import path from 'path';

import GameInfoInCsv from '../interfaces/GameInfoInCsv';

const workbook = new Excel.Workbook();
let worksheet: Excel.Worksheet;
getWorksheet().then(worksheetReceived => {
  worksheet = worksheetReceived
});

async function getWorksheet() {
  try {
    await workbook.xlsx.readFile(path.resolve(__dirname, '../', `Games.xlsx`));

    return workbook.getWorksheet(1);
  } catch (err) {
    return workbook.addWorksheet('Games');
  }
}

async function writeInfoToExcelFile(gameInfoInCsv: GameInfoInCsv) {
  worksheet.columns = Object.keys(gameInfoInCsv).map(key => ({ header: key, key: key }));
  worksheet.addRow(gameInfoInCsv);

  await workbook.xlsx.writeFile(path.resolve(__dirname, '../', `Games.xlsx`));
}

export { writeInfoToExcelFile };