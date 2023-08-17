({
  method: async ({ id }) => {
    try {
      const result = await crud('ItemValue').select({ id });
      if (result.rows.length === 1) {
        const [ value ] = result.rows;
        return responseType.modifiedBodyTemplate(responseType.success, {
          value
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        value: undefined
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  }
});
