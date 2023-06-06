({
  method: async ({ clientId, file }) => {
    try {
      let message = responseType.success().message;
      const result = await lib.excel.getDataFromExcel(clientId, file);
      if (!result)
        message = 'Excel doesn\'t contain special identifier to Import';
      else {
        message = 'Excel has been imported';
      }

      return responseType.modifiedBodyTemplate(responseType.success, {
        message,
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
