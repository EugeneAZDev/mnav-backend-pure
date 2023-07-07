({
  method: async () => {
    try {
      const token = common.generateTempToken();
      if (token) {
        return responseType.modifiedBodyTemplate(responseType.success, {
          token
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        token: undefined
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  }
});
