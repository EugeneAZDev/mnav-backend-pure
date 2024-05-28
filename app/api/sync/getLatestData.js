({
  method: async ({ clientId, tableName, localDates }) => {
    try {
      const records = await db.processTransaction(domain.sync.getLatestData, clientId, tableName, localDates);
      return responseType.modifiedBodyTemplate(responseType.success, { records });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
