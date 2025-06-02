({
  method: async ({ clientId, ...records }) => {
    try {
      const createdAt = await domain.getLocalTime(clientId);
      const { itemIds, doneItemIds } = records;

      const newRecord = {
        userId: clientId,
        itemIds,
        doneItemIds,
        createdAt,
        startedAt: createdAt,
      };

      const result = await crud('RecordChallenge').create([newRecord]);
      const [created] = result.rows;

      return responseType.modifiedBodyTemplate(responseType.created, {
        created
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
