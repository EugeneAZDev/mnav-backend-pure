({
  method: async ({ clientId, file }) => {
    try {
      const excelData = await lib.excel.getDataFromExcel(file);
      await db.processTransaction(domain.upload, clientId, excelData);
    } catch (error) {
      return responseType.modifiedBodyTemplate(responseType.error, {
        message: `Import failed: ${error.message}`
      });
    }

    return responseType.modifiedBodyTemplate(responseType.success, {
      message: 'File has been imported',
    });
  },
});
