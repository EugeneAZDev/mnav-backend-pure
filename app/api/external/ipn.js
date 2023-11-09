// Instant Payment Notification Endpoint (IPN)
({
  access: 'public',
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, ...payload }) => {
    try {
      await db.processTransaction(domain.external.setPremium, payload);
      return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
