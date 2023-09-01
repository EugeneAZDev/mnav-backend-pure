const MY_ACTIVITY = 'MyActivity';

({
  applyCellsStyle(data, sheet) {
    const font = { name: 'Calibri', size: 9 };
    for (const [key, value] of data) {
      for (const cellName of key) {
        const cell = sheet.getCell(cellName);
        cell.style = { ...cell.style, ...value };
        cell.style = { ...cell.style, font };
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
      if (Number.isNaN(column.width) || column.width > 12) column.width = 12;
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
      const cell = sheet.getCell('C1');
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

  getItemFromRow(rowNumber, sheet) {
    const ITEM_DETAILS = {
      C: 'title',
      D: 'description',
      E: 'target',
    };
    const VALUE_TYPES = {
      s: 'seconds',
      m: 'minutes',
    };

    const item = {};
    const values = [];
    let valueType;
    let valueAssessment = true;

    const row = sheet.getRow(rowNumber);
    row.eachCell((cell) => {
      const cellLetter = cell.address.match(/[a-zA-Z]+/)[0];
      if (cellLetter === 'A' && cell.value) {
        valueAssessment = false;
      } else if (cellLetter === 'B' && cell.value) {
        valueType = VALUE_TYPES[cell.value];
      } else if (['C', 'D', 'E', 'F'].includes(cellLetter)) {
        if (cell.value) item[ITEM_DETAILS[cellLetter]] = cell.value;
      } else {
        const monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        const cellDate = sheet.getCell(cellLetter + 2).value;
        const date = new Date(cellDate);
        const validDate = date instanceof Date && !isNaN(date);
        let year;
        let month;
        let day;
        if (!validDate) {
          const dateParts = cellDate.split('-');
          year = parseInt(dateParts[2]);
          month = monthNames.indexOf(dateParts[1]);
          day = parseInt(dateParts[0]);
        } else {
          year = date.getFullYear();
          month = date.getMonth();
          day = date.getDate();
        }
        const utcDate = new Date(Date.UTC(year, month, day));
        const time = { time: new Date(utcDate) };
        const type = cell.value.formula ? 'formula' : 'value';
        if (cell.value.toString() === 'NaN') {
          throw Error(`NaN value for ${utcDate}`);
        }
        if (type === 'formula') {
          if (!valueType) valueType = 'number';
          const arrayValues = cell.value.formula
            .split('+')
            .map((v) => v.replace('=', ''));
          for (const value of arrayValues) {
            if (value.includes('*')) {
              const subValues = value.split('*');
              if (+subValues[1] === 60) {
                const value = subValues[0] * 60;
                values.push({ value: +value, ...time });
              } else {
                for (let i = 0; i < +subValues[1]; i++) {
                  values.push({ value: +subValues[0], ...time });
                }
              }
            } else {
              values.push({ value: +value, ...time });
            }
          }
        } else {
          if (!valueType)
            valueType = this.validNumberValue(cell.value) ? 'number' : 'text';
          if (valueType === 'text' && cell.value.length > 1) {
            cell.value
              .replace('\n', '')
              .split(',')
              .map((value) => {
                values.push({ value: value.trim(), ...time });
              });
          } else if (typeof cell.value === 'object') {
            values.push({ value: +cell.result, ...time });
          } else values.push({ value: +cell.value, ...time });
        }
      }
    });
    item.valueType = valueType;
    item.valueAssessment = valueAssessment;
    item.values = values;
    return item;
  },

  pushItem(items, item, sectionName) {
    if (item && item.values.length > 0) {
      item.section = sectionName;
      items.push(item);
    }
  },

  getSectionName(worksheet, rowNumber) {
    const row = worksheet.getRow(rowNumber);
    let nonEmptyCellCount = 0;
    let name = false;
    for (const value of row.values) {
      if (value !== null && value !== undefined && value !== '') {
        name = value;
        nonEmptyCellCount++;
        if (nonEmptyCellCount > 1) {
          return false;
        }
      }
    }
    if (name.toLowerCase() === MY_ACTIVITY.toLowerCase()) return false;
    return name;
  },

  getSectionNameAndRowNumber(sheet) {
    const list = [];
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      const name = this.getSectionName(sheet, rowNumber);
      if (name !== false) list.push([name, rowNumber]);
    });
    return list;
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

  fillCellValuesFromItem(
    items,
    row,
    letters,
    centerStyle,
    cellValues,
    cellFormulaValues,
    rowsFixedHeight,
    cellsToCenterWrapTextStyle,
  ) {
    for (const item in items) {
      const itemValues = {
        description: undefined,
        target: undefined,
        title: undefined,
        valueType: undefined,
        valueAssessment: undefined,
      };

      for (const [day, valueObj] of Object.entries(items[item])) {
        Object.assign(itemValues, valueObj);
        const letter = letters.get(day);
        const cell = `${letter}${row}`;
        if (itemValues.valueType !== 'text') {
          centerStyle.push(cell);
          if (itemValues.values.length > 1) {
            const resultString = itemValues.values.reduce(
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
            cellValues.set(cell, Number(itemValues.values[0]));
          }
        } else if (itemValues.values.length > 0) {
          let resultString = itemValues.values[0];
          if (itemValues.values.length !== 1) {
            const combinedValues = itemValues.values.reduce((res, str) => {
              const separator = ', \n';
              res += `${str}${separator}`;
              return res;
            }, '');
            resultString = combinedValues.slice(0, -3);
          }
          cellValues.set(cell, resultString);
          cellsToCenterWrapTextStyle.push(cell);
          rowsFixedHeight.push(row);
        }
      }

      for (let i = 0; i < 5; i++) {
        // Char codes for A, B, C, D, E
        centerStyle.push(`${String.fromCharCode(65 + i)}${row}`);
      }

      if (!itemValues.valueAssessment) cellValues.set(`A${row}`, '-');
      const excelValueType =
        itemValues.valueType !== 'number' && itemValues.valueType !== 'text' ?
          itemValues.valueType[0] :
          undefined;
      excelValueType && cellValues.set(`B${row}`, excelValueType);
      cellValues.set(`C${row}`, itemValues.title);
      if (itemValues.description && itemValues.description.length > 0)
        cellValues.set(`D${row}`, itemValues.description);
      if (itemValues.target !== null)
        cellValues.set(`E${row}`, itemValues.target);
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

  validNumberValue(target) {
    return (typeof target === 'string' || typeof target === 'number') &&
      !isNaN(Number(target)) ?
      Number(target) :
      undefined;
  },

  async createExcelFile(clientId) {
    const CENTER_STYLE = { alignment: { horizontal: 'center' } };
    const BOLD_CENTER_STYLE = {
      font: { bold: true },
      alignment: { horizontal: 'center' },
    };
    const CENTER_WRAPTEXT_STYLE = {
      alignment: { horizontal: 'center', wrapText: true },
    };

    const cellStyles = new Map([
      [
        ['C1'],
        {
          alignment: { horizontal: 'center' },
          font: { bold: true, color: { argb: 'FFBEBEBE' } },
        },
      ],
      [['G2', 'H2'], CENTER_STYLE],
      [['C2', 'D2', 'E2', 'F2'], BOLD_CENTER_STYLE],
    ]);

    const cellValues = new Map([
      ['C1', 'MyActivity'],
      ['C2', 'Title (ABR)'],
      ['D2', 'Description'],
      ['E2', 'Target'],
      ['F2', 'Date >'],
    ]);

    const cellFormulaValues = new Map();
    const cellsToCenterWrapTextStyle = [];
    const rowsFixedHeight = [];

    const DESCRIPTION_COLUMN = 6;
    let LATEST_COLUMN = 8;

    const wb = new common.ExcelJS.Workbook();
    wb.properties.date1904 = false;
    wb.locale = 'en-US';

    const sheet = wb.addWorksheet(MY_ACTIVITY);

    const { body } = await api.value.getByUser().method({ clientId });
    const exportValues = body && body.values;

    const cellsToCenterStyle = [];
    const cellsToBoldCenterStyle = [];
    if (exportValues.length === 0) {
      const today = new Date();
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
      cellValues.set('G2', today);
      cellValues.set('H2', yesterday);
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
          const { target, title, description, valueType, valueAssessment } =
            rec;

          result[section][itemId][day] = {
            description,
            target,
            title,
            valueType,
            valueAssessment,
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
          cellValues,
          cellFormulaValues,
          rowsFixedHeight,
          cellsToCenterWrapTextStyle,
        );
        rowNumber += 1;
      }
      for (const section in groupedValues) {
        const sectionCell = `D${rowNumber}`;
        cellValues.set(sectionCell, section);
        cellsToBoldCenterStyle.push(sectionCell);
        rowNumber += 1;
        rowNumber = this.fillCellValuesFromItem(
          groupedValues[section],
          rowNumber,
          dayLetterColumnMap,
          cellsToCenterStyle,
          cellValues,
          cellFormulaValues,
          rowsFixedHeight,
          cellsToCenterWrapTextStyle,
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

    sheet.getColumn(1).width = 1.5;
    sheet.getColumn(2).width = 1.75;
    for (let i = 2; i <= LATEST_COLUMN; i++) {
      this.autoWidthFormat(sheet.getColumn(i + 1));
    }

    [...new Set(rowsFixedHeight)].map(
      (rowNumber) => (sheet.getRow(rowNumber).height = 15),
    );

    const buffer = await wb.xlsx.writeBuffer();
    return buffer;
  },

  async getDataFromExcel(file) {
    const wb = new common.ExcelJS.Workbook();
    wb.properties.date1904 = false;
    wb.locale = 'en-US';

    await wb.xlsx.load(file);
    const sheet = this.getActivitySheet(wb);
    if (!sheet)
      throw Error('File doesn\'t contain special identifier to Import');

    const TITLE_ROW_NUMBER = 2;
    const items = [];
    const list = this.getSectionNameAndRowNumber(sheet);

    const [, startFirstSectionRowNumber] = list[0];
    const lastRowNumber = sheet.lastRow.number;

    for (
      let i = TITLE_ROW_NUMBER + 1;
      i < startFirstSectionRowNumber - 1;
      i++
    ) {
      this.pushItem(items, this.getItemFromRow(i, sheet));
    }

    for (let i = 0; i < list.length; i++) {
      const [name, startRowNumber] = list[i];
      if (i < list.length - 1) {
        const [, endRowNumber] = list[i + 1];
        for (let j = startRowNumber + 1; j < endRowNumber; j++) {
          this.pushItem(items, this.getItemFromRow(j, sheet), name);
        }
      } else {
        for (let j = startRowNumber + 1; j < lastRowNumber + 1; j++) {
          this.pushItem(items, this.getItemFromRow(j, sheet), name);
        }
      }
    }

    return items;
  },
});
