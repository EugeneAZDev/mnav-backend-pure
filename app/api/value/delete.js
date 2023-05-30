({
  method: async ({ id }) => {
    try {
      await db('ItemValue').delete(id);
      return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  }
});
