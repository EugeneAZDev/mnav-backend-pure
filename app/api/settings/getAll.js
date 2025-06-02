({
  access: 'public',
  method: async () => {
    try {
      const result = await crud('Settings').select({
        fields: [
          'adminEmail',
          'domain',
          'disableRegistration',
          'releaseNoteMobTitle',
        ],
      });
      if (result.rows.length > 0) {
        const [ settings ] = result.rows;
        return responseType.modifiedBodyTemplate(responseType.success, {
          settings
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        settings: undefined
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  }
});
