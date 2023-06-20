({
  method: async ({ clientId }) => {
    try {
      const result = await crud('Item').find('userId', [clientId]);
      if (result.rows.length > 0) {
        const items = result.rows;
        return responseType.modifiedBodyTemplate(responseType.success, {
          items
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        items: [],
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
