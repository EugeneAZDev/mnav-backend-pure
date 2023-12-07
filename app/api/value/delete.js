({
  method: async ({ clientId, id }) => {
    try {
      await db.processTransaction(domain.value.delete, clientId, id);
      return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
