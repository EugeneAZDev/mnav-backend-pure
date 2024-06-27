({
  method: async ({ clientId, firstTime, tableName, localDates }) => {
    try {
      const records = await db.processTransaction(
        domain.sync.getLatestData,
        clientId,
        firstTime,
        tableName,
        localDates);
      return responseType.modifiedBodyTemplate(responseType.success, { records });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
