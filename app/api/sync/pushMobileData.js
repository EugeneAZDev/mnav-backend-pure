({
  method: async ({ clientId, data }) => {
    try {
      const records = await db.processTransaction(domain.sync.pushMobileData, clientId, data);
      return responseType.modifiedBodyTemplate(responseType.success, { records });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
