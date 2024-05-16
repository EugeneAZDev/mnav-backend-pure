({
  method: async ({ clientId, tableName, localDates }) => {
    try {
      const records = await db.processTransaction(domain.sync.getLatestDates, clientId, tableName, localDates);      
      return responseType.modifiedBodyTemplate(responseType.success, { records });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
