({
  method: async ({ id }) => {
    try {
      const valuesCount = await db('ItemValue').count('itemId', [id]);
      return httpResponses.modifiedBodyTemplate(httpResponses.success, {
        count: parseInt(valuesCount)
      });
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
