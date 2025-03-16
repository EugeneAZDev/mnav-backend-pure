({
  method: async ({ clientId, tableName, localDates, mobVersion }) => {
    try {
      const records = await db.processTransaction(
        domain.sync.getLatestData,
        clientId,
        tableName,
        localDates,
        mobVersion,
      );

      return responseType.modifiedBodyTemplate(
        responseType.success, { records }
      );
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
