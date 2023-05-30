const wb = new common.ExcelJS.Workbook();
wb.properties.date1904 = false;
wb.locale = 'en-US';

({
  async createExcelFile(clientId) {
    console.log('Create Excel File', clientId);
    const result = api.item.get.toString();
    console.log(result);
    // console.log(items);
    // return items;
    // const buffer = await wb.xlsx.writeBuffer();
    // return buffer;
  }
});
