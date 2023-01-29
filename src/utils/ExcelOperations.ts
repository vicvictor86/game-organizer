import Excel from 'exceljs';
import path from 'path';

import GameInfoInCsv from '../interfaces/GameInfoInCsv';

const workbook = new Excel.Workbook();
const worksheet = workbook.addWorksheet('Games');

async function writeInfoToExcelFile(gameInfoInCsv: GameInfoInCsv) {
  worksheet.columns = Object.keys(gameInfoInCsv).map(key => ({ header: key, key: key }));
  worksheet.addRow(gameInfoInCsv);
  await workbook.xlsx.writeFile(path.resolve(__dirname, `teste.xlsx`));
}

export { writeInfoToExcelFile };