({
  method: async ({ clientId }) => {
    try {
      const result = await crud('Item').select({ where: { userId: clientId } });
      if (result.rows.length > 0) {
        const items = result.rows;
        const rawValues = await crud('ItemValue').select({
          where: { itemId: [...items.map((r) => r.id)] },
        });        
        return responseType.modifiedBodyTemplate(responseType.success, {
          countObj: {
            items: items.length,
            values: rawValues.rows.length
          }
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        countObj: {},
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
