({
  method: async ({ clientId, data }) => {
    try {
      await db.processTransaction(domain.user.setPremium, clientId, data);
      return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
