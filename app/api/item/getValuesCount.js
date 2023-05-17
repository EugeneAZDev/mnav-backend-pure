({
  method: async ({ id }) => {
    try {
      const valuesCount = await db('ItemValue').count('itemId', [id]);
      return {
        ...httpResponses.success(),
        body: parseInt(valuesCount),
      };
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
