({
  method: async ({ id }) => {
    try {
      const result = await crud('Item').select({ id });
      if (result.rows.length === 1) {
        const [item] = result.rows;
        return responseType.modifiedBodyTemplate(responseType.success, {
          item,
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        item: undefined,
      });
    } catch (error) {
      console.log(error);
      return { ...responseType.error(), error };
    }
  },
});
