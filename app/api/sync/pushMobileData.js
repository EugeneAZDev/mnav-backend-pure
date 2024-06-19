({
  method: async ({ clientId, data, tableName }) => {
    try {
      const records = await db.processTransaction(
        domain.sync.pushMobileData,
        clientId,
        data,
        tableName
      );
      return responseType.modifiedBodyTemplate(responseType.success, { records });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
