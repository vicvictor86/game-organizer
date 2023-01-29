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

function stylingSheet(gameInfoInCsv: GameInfoInCsv) {
  if(!worksheet.columns) {
    worksheet.columns = Object.keys(gameInfoInCsv).map(key => ({ header: key, key: key }));
  }

  worksheet.columns.forEach(column => {
    if (!column.width) {
      column.width = 15;
    }
  })

  worksheet.getRow(1).font = {
    bold: true,
    size: 13,
  };

  worksheet.getRow(1).alignment = {
    horizontal: 'center',
    vertical: 'middle',
  };

  worksheet.getRow(1).eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '404040' },
    };
  });

  worksheet.eachRow(row => {
    row.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    }
  });
}

async function writeInfoToExcelFile(gameInfoInCsv: GameInfoInCsv) {
  stylingSheet(gameInfoInCsv);

  worksheet.addRow(gameInfoInCsv);

  await workbook.xlsx.writeFile(path.resolve(__dirname, '../', `Games.xlsx`));
}

export { writeInfoToExcelFile };