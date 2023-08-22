({
  method: async ({ clientId }) => {
    try {      
      await db.processTransaction(domain.user.updateDetails, clientId);
      return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
