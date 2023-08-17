({
  method: async ({ clientId }) => {
    try {
      // TODO Implement logic
      return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
