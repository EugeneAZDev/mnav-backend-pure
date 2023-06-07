({
  method: async ({ clientId, file }) => {
    try {
      const result = await lib.excel.getDataFromExcel(clientId, file);
      return responseType.modifiedBodyTemplate(responseType.success, {
        message: result ?
          'File has been imported' :
          'File doesn\'t contain special identifier to Import',
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
