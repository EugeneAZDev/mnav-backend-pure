const basisCellStyles = new Map([
  [
    ['B1'],
    {
      alignment: { horizontal: 'center' },
      font: { bold: true, color: { argb: 'FFBEBEBE' } },
    },
  ],
  [['F2', 'G2'], { alignment: { horizontal: 'center' } }],
  [
    ['B2', 'C2', 'D2', 'E2'],
    {
      font: { bold: true },
      alignment: { horizontal: 'center' },
    },
  ],
]);

const basisCellValues = new Map([
  ['B1', 'MyActivity'],
  ['B2', 'Title (ABR)'],
  ['C2', 'Description'],
  ['D2', 'Target'],
  ['E2', 'Data >'],
]);

({
  applyCellsStyle(data, sheet) {
    for (const [key, value] of data) {
      for (const cellName of key) {
        const cell = sheet.getCell(cellName);
        cell.style = { ...cell.style, ...value };
      }
    }
  },

  autoWidthFormat(column) {
    if (column.values.length > 0) {
      const maxLength = column.values.reduce((prev, next) =>
        (prev.length > next.length ? prev : next),
      ).length;
      column.width = maxLength + 2;
      if (Number.isNaN(column.width)) column.width = 10;
    }
  },

  setCellDateValue(sheet, cell, date) {
    const formatted = date
      .toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      .replace(/ /g, '-');
    sheet.getCell(cell).value = formatted;
    sheet.getCell(cell).numFmt = 'd-mmm-yy';
  },

  fillCells(data, sheet) {
    for (const [key, value] of data) {
      typeof value === 'string' ?
        (sheet.getCell(key).value = value) :
        this.setCellDateValue(sheet, key, value);
    }
  },

  async createExcelFile(clientId) {
    const wb = new common.ExcelJS.Workbook();
    wb.properties.date1904 = false;
    wb.locale = 'en-US';
    const sheet = wb.addWorksheet('MyActivities');

    const { body } = await api.value.exportByUser().method({ clientId });
    const exportValues = body && body.exportValues;
    if (exportValues.length === 0) {
      const today = new Date();
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
      basisCellValues.set('F2', today);
      basisCellValues.set('G2', yesterday);
      console.log(basisCellValues);
    } else {
      console.log('else');
    }

    this.fillCells(basisCellValues, sheet);
    this.applyCellsStyle(basisCellStyles, sheet);

    // Sort out max column
    for (let i = 1; i <= 7; i++) {
      this.autoWidthFormat(sheet.getColumn(i));
    }

    const buffer = await wb.xlsx.writeBuffer();
    return buffer;
  },
});
