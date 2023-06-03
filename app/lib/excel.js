const CENTER_STYLE = { alignment: { horizontal: 'center' } };
const BOLD_CENTER_STYLE = {
  font: { bold: true },
  alignment: { horizontal: 'center' },
};

const cellStyles = new Map([
  [
    ['B1'],
    {
      alignment: { horizontal: 'center' },
      font: { bold: true, color: { argb: 'FFBEBEBE' } },
    },
  ],
  [['F2', 'G2'], CENTER_STYLE],
  [['B2', 'C2', 'D2', 'E2'], BOLD_CENTER_STYLE],
]);

const cellValues = new Map([
  ['B1', 'MyActivity'],
  ['B2', 'Title (ABR)'],
  ['C2', 'Description'],
  ['D2', 'Target'],
  ['E2', 'Data >'],
]);

const cellFormulaValues = new Map();

({
  applyCellsStyle(data, sheet) {
    for (const [key, value] of data) {
      for (const cellName of key) {
        const cell = sheet.getCell(cellName);
        cell.style = { ...cell.style, ...value };
      }
    }
  },

  arraysEqual(source, target) {
    if (source.length !== target.length) {
      return false;
    }
    for (let i = 0; i < source.length; i++) {
      if (source[i] !== target[i]) {
        return false;
      }
    }
    return true;
  },

  autoWidthFormat(column) {
    if (column.values.length > 0) {
      const maxLength = column.values.reduce((prev, next) =>
        (prev.length > next.length ? prev : next),
      ).length;
      column.width = maxLength + 2;
      if (Number.isNaN(column.width)) column.width = 12;
    }
  },

  formatToDay(date) {
    return date
      .toLocaleDateString('en-GB', {
        day: 'numeric', // '2-digit'
        month: 'short',
        year: 'numeric',
      })
      .replace(/ /g, '-');
  },

  getExcelAlpha(columnNumber) {
    let dividend = columnNumber;
    let columnName = '';
    let modulo;

    while (dividend > 0) {
      modulo = (dividend - 1) % 26;
      columnName = String.fromCharCode(65 + modulo) + columnName;
      dividend = Math.floor((dividend - modulo) / 26);
    }

    return columnName;
  },

  setCellDateValue(sheet, cell, date) {
    const day = this.formatToDay(date);
    sheet.getCell(cell).value = day;
    sheet.getCell(cell).numFmt = 'd-mmm-yy';
  },

  fillCells(data, sheet) {
    for (const [key, value] of data) {
      if (typeof value === 'object') {
        this.setCellDateValue(sheet, key, value);
      } else {
        sheet.getCell(key).value = value;
      }
    }
  },

  findCellsByStyle(map, style) {
    return [...map.entries()]
      .filter(
        ([, cellStyle]) => JSON.stringify(cellStyle) === JSON.stringify(style),
      )
      .map(([cells]) => cells)
      .flat();
  },

  fillCellValuesFromItem(items, row, letters, centerStyle) {
    for (const item in items) {
      let description;
      let title;
      let valueType;
      for (const day in items[item]) {
        const valueObj = items[item][day];
        const values = valueObj.values;
        if (!title && !description) {
          title = valueObj.title;
          description = valueObj.description;
        }
        if (!valueType) {
          valueType = valueObj.valueType;
        }
        const letter = letters.get(day);
        const cell = `${letter}${row}`;
        centerStyle.push(cell);
        if (valueType !== 'text') {
          if (values.length > 1) {
            const resultString = values.reduce(
              (obj, val, index) => {
                const num = Number(val);
                obj.formula += `${index === 0 ? '=' : '+'}${num}`;
                obj.result += num;
                return obj;
              },
              { formula: '', result: 0 },
            );
            cellFormulaValues.set(cell, resultString);
          } else {
            cellValues.set(cell, Number(values[0]));
          }
        } else if (values.length > 0) {
          console.log(values);
          const resultString = values.reduce((res, str, index) => {
            const separator = ', \n';
            if (index === 0) {
              const lines = str.split(' ');
              res +=
                lines.length > 1 ?
                  `${lines[0]}\n${lines[1]}${separator}` :
                  `${lines[0]}${separator}`;
            } else {
              res += `${str}${separator}`;
            }
            return res;
          }, '');
          cellValues.set(cell, resultString);
        }
      }
      const excelValueType =
        valueType !== 'number' && valueType !== 'text' ?
          valueType[0] :
          undefined;
      excelValueType && cellValues.set(`A${row}`, excelValueType);
      cellValues.set(`B${row}`, title);
      centerStyle.push(`B${row}`);
      cellValues.set(`C${row}`, description);
      centerStyle.push(`C${row}`);
      row += 1;
    }
    return row;
  },

  fillFormulas(data, sheet) {
    for (const [key, { formula, result }] of data) {
      sheet.getCell(key).value = { formula, result };
    }
  },

  removeCellStylesElement(map, key) {
    for (const [k] of map) {
      if (this.arraysEqual(k, key)) {
        map.delete(k);
        break;
      }
    }
  },

  async createExcelFile(clientId) {
    let LATEST_COLUMN = 7;
    const wb = new common.ExcelJS.Workbook();
    wb.properties.date1904 = false;
    wb.locale = 'en-US';
    const sheet = wb.addWorksheet('MyActivities');

    const { body } = await api.value.exportByUser().method({ clientId });
    const exportValues = body && body.exportValues;
    const cellsToCenterStyle = [];
    const cellsToBoldCenterStyle = [];

    if (exportValues.length === 0) {
      const today = new Date();
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
      cellValues.set('F2', today);
      cellValues.set('G2', yesterday);
    } else {
      const groupedValues = exportValues.reduce((result, rec) => {
        const { section, itemId, value, createdAt } = rec;
        if (!result[section]) {
          result[section] = {};
        }
        if (!result[section][itemId]) {
          result[section][itemId] = {};
        }
        const day = this.formatToDay(createdAt);
        if (!result[section][itemId][day]) {
          const { target, title, description, valueType } = rec;

          result[section][itemId][day] = {
            valueType,
            title,
            description,
            target,
            values: [],
          };
        }

        result[section][itemId][day].values.push(value);
        return result;
      }, {});
      const setOfAllDays = new Set();
      for (const section in groupedValues) {
        for (const item in groupedValues[section]) {
          for (const day in groupedValues[section][item]) setOfAllDays.add(day);
        }
      }
      const days = Array.from(setOfAllDays).sort(
        (a, b) => new Date(b) - new Date(a),
      );
      LATEST_COLUMN = days.length + 6;

      let rowNumber = 2;
      const dayLetterColumnMap = new Map();
      for (let i = 0; i < days.length; i++) {
        const columnLetter = this.getExcelAlpha(7 + i);
        cellsToCenterStyle.push(`${columnLetter}2`);
        dayLetterColumnMap.set(days[i], columnLetter);
        cellValues.set(`${columnLetter}${rowNumber}`, days[i]);
      }
      rowNumber += 1;
      if (null in groupedValues) {
        const noneSectionValues = groupedValues[null];
        delete groupedValues[null];
        rowNumber = this.fillCellValuesFromItem(
          noneSectionValues,
          rowNumber,
          dayLetterColumnMap,
          cellsToCenterStyle,
        );
        rowNumber += 1;
      }
      for (const section in groupedValues) {
        const sectionCell = `C${rowNumber}`;
        cellValues.set(sectionCell, section);
        cellsToBoldCenterStyle.push(sectionCell);
        rowNumber += 1;
        rowNumber = this.fillCellValuesFromItem(
          groupedValues[section],
          rowNumber,
          dayLetterColumnMap,
          cellsToCenterStyle,
        );
        rowNumber += 1;
      }
    }

    const centerStyleCells = this.findCellsByStyle(cellStyles, CENTER_STYLE);
    this.removeCellStylesElement(cellStyles, centerStyleCells);
    cellStyles.set([...centerStyleCells, ...cellsToCenterStyle], CENTER_STYLE);
    const centerBoldStyleCells = this.findCellsByStyle(
      cellStyles,
      BOLD_CENTER_STYLE,
    );
    this.removeCellStylesElement(cellStyles, centerBoldStyleCells);
    cellStyles.set(
      [...centerBoldStyleCells, ...cellsToBoldCenterStyle],
      BOLD_CENTER_STYLE,
    );
    this.fillCells(cellValues, sheet);
    this.fillFormulas(cellFormulaValues, sheet);
    this.applyCellsStyle(cellStyles, sheet);

    for (let i = 1; i <= LATEST_COLUMN; i++)
      this.autoWidthFormat(sheet.getColumn(i));

    const buffer = await wb.xlsx.writeBuffer();
    return buffer;
  },
});
