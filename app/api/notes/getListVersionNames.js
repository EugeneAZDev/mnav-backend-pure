({
  access: 'public',
  method: async ({ clientId, type }) => {
    try {
      const jsonFilePath = `${settings.appPath}/resources/html/data.json`;
      const jsonObj = await common.readJsonFromFile(jsonFilePath);
      const htmlFiles = jsonObj[type];
      return responseType.modifiedBodyTemplate(responseType.success, { htmlFiles });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
