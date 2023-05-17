({
  method: async ({ id }) => {
    try {
      const valuesCount = await db('ItemValue').count('itemId', [id]);
      if (valuesCount > 0) {
        return {
          ...httpResponses.error(),
          body: 'Unable to delete Item with associated values',
        };
      }
      await db('Item').delete(id);
      return httpResponses.deleted();
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
