({
  method: async ({ id }) => {
    try {
      const valuesCount = await crud('ItemValue').select({
        count: 'id',
        where: { itemId: id },
      });
      if (valuesCount > 0) {
        return {
          ...responseType.error(),
          body: { message: 'Unable to delete Item with associated values' },
        };
      }
      await crud('Item').delete([id]);
      return responseType.deleted();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
