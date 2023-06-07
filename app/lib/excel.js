const CENTER_STYLE = { alignment: { horizontal: 'center' } };
const BOLD_CENTER_STYLE = {
  font: { bold: true },
  alignment: { horizontal: 'center' },
};
const CENTER_WRAPTEXT_STYLE = {
  alignment: { horizontal: 'center', wrapText: true },
};

const MY_ACTIVITY = 'MyActivity';
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
const cellsToCenterWrapTextStyle = [];
const rowsFixedHeight = [];

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
      column.width = maxLength + 3;
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

  getActivitySheet(wb) {
    for (const sheet of wb.worksheets) {
      const cell = sheet.getCell('B1');
      if (
        cell.value &&
        cell.value.toString().toLowerCase() === MY_ACTIVITY.toLowerCase()
      )
        return sheet;
    }
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
      let target;
      let title;
      let valueType;
      for (const day in items[item]) {
        const valueObj = items[item][day];
        const values = valueObj.values;
        if (!title && !description && !target) {
          title = valueObj.title;
          description = valueObj.description;
          target = valueObj.target;
        }
        if (!valueType) {
          valueType = valueObj.valueType;
        }
        const letter = letters.get(day);
        const cell = `${letter}${row}`;
        if (valueType !== 'text') {
          centerStyle.push(cell);
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
          let resultString = values[0];
          if (values.length !== 1) {
            const combinedValues = values.reduce((res, str, index) => {
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
            resultString = combinedValues.slice(0, -4);
          }
          cellValues.set(cell, resultString);
          cellsToCenterWrapTextStyle.push(cell);
          rowsFixedHeight.push(row);
        }
      }
      const excelValueType =
        valueType !== 'number' && valueType !== 'text' ?
          valueType[0] :
          undefined;
      excelValueType && cellValues.set(`A${row}`, excelValueType);
      cellValues.set(`B${row}`, title);
      centerStyle.push(`B${row}`);
      if (description.length > 0) {
        cellValues.set(`C${row}`, description);
        centerStyle.push(`C${row}`);
      }
      if (target !== null) {
        cellValues.set(`D${row}`, target);
        centerStyle.push(`D${row}`);
      }
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
    const DESCRIPTION_COLUMN = 5;
    let LATEST_COLUMN = 7;

    const wb = new common.ExcelJS.Workbook();
    wb.properties.date1904 = false;
    wb.locale = 'en-US';

    const sheet = wb.addWorksheet(MY_ACTIVITY);

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
      LATEST_COLUMN = days.length + DESCRIPTION_COLUMN;

      let rowNumber = 2;
      const dayLetterColumnMap = new Map();
      for (let i = 0; i < days.length; i++) {
        const columnLetter = this.getExcelAlpha(DESCRIPTION_COLUMN + 1 + i);
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

    cellStyles.set(cellsToCenterWrapTextStyle, CENTER_WRAPTEXT_STYLE);

    this.fillCells(cellValues, sheet);
    this.fillFormulas(cellFormulaValues, sheet);
    this.applyCellsStyle(cellStyles, sheet);

    for (let i = 0; i <= LATEST_COLUMN; i++) {
      this.autoWidthFormat(sheet.getColumn(i + 1));
    }

    [...new Set(rowsFixedHeight)].map(
      (rowNumber) => (sheet.getRow(rowNumber).height = 15),
    );

    const buffer = await wb.xlsx.writeBuffer();
    return buffer;
  },

  async getDataFromExcel(clientId, file) {
    const wb = new common.ExcelJS.Workbook();
    wb.properties.date1904 = false;
    wb.locale = 'en-US';

    await wb.xlsx.load(file);
    const sheet = this.getActivitySheet(wb);
    if (!sheet) return;

    return true;
  },
});
