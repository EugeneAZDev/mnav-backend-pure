({
  method: async ({ clientId, tableName, syncDate, recordsToUpdate }) => {
    try {
      const result = await db.processTransaction(
        domain.sync.syncData,
        clientId,
        tableName,
        syncDate,
        recordsToUpdate);
      return responseType.modifiedBodyTemplate(responseType.success, { result });
    } catch (error) {
      console.error(error)
      return { ...responseType.error(), error };
    }
  },
});
