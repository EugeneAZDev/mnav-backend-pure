// Instant Payment Notification Endpoint (IPN)
({
  access: 'public',
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, ...payload }) => {
    try {
      const res = await db.processTransaction(
        domain.external.setPremium,
        payload,
      );

      return { code: 200, body: res };
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
