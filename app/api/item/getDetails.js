({
  method: async ({ itemIds }) => {
    try {
      if (itemIds && itemIds.length > 0) {
        const result = await crud('ValueDetail').find('itemId', itemIds);
        if (result.rows.length > 0) {
          return responseType.modifiedBodyTemplate(responseType.success, {
            details: result.rows,
          });
        }
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        lastValue: undefined,
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
