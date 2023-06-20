({
  method: async ({ clientId, file }) => {
    const excelData = await lib.excel.getDataFromExcel(file);
    await db.processTransaction(domain.upload, clientId, excelData);

    return responseType.modifiedBodyTemplate(responseType.success, {
      message: 'File has been imported',
    });
  },
});
