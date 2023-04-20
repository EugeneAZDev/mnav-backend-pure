({
  method: async ({ id }) => {
    try {
      await db('ItemValue').delete(id);
      return httpResponses.success();
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  }
});
