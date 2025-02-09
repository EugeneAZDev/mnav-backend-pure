({
  method: async ({ clientId, file }) => {
    try {
      const excelData = await lib.excel.getDataFromExcel(file);
      const resultOfImport = await db.processTransaction(
        domain.exchange.upload, clientId, excelData);
      const { sections, items, values } = resultOfImport;
      return responseType.modifiedBodyTemplate(responseType.success, {
        message: 'FileHasBeenImported',
        counts: { sections, items, values },
      });
    } catch (error) {
      return responseType.modifiedBodyTemplate(responseType.error, {
        message: `Import failed: ${error.message}`
      });
    }
  },
});
