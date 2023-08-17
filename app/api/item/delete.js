({
  method: async ({ clientId, id }) => {
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
      const deletedAt = await domain.getLocalTime(clientId);
      await crud('Item').update({
        id,
        fields: { deletedAt }
      });
      return responseType.deleted();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
