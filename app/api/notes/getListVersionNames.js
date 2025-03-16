({
  access: 'public',
  method: async ({ type }) => {
    try {
      // eslint-disable-next-line no-undef
      const jsonFilePath = `${settings.appPath}/resources/html/data.json`;
      const jsonObj = await common.readJsonFromFile(jsonFilePath);
      const htmlFiles = jsonObj[type];
      return responseType.modifiedBodyTemplate(
        responseType.success, { htmlFiles }
      );
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
