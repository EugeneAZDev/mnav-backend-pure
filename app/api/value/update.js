({
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, ...records }) => {
    try {
      await db.processTransaction(
        domain.value.update,
        clientId,
        records,
      );
      return responseType.updated();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
