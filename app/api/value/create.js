({
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, ...records }) => {
    try {
      const valueId =
        await db.processTransaction(domain.value.create, clientId, records);
      return responseType.modifiedBodyTemplate(responseType.created, {
        valueId
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
