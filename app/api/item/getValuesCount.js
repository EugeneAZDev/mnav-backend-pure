({
  method: async ({ id }) => {
    try {
      const valuesCount = await crud('ItemValue').select({
        count: 'id',
        where: { itemId: id },
      });
      return responseType.modifiedBodyTemplate(responseType.success, {
        count: parseInt(valuesCount)
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
