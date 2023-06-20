({
  method: async ({ id }) => {
    try {
      await crud('ItemValue').delete([id]);
      return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  }
});
