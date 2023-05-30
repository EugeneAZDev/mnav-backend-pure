({
  method: async ({ id }) => {
    try {
      const result = await db('ItemValue').read(id);
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
