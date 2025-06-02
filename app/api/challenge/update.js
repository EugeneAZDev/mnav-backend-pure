({
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, ...records }) => {
    try {
      const updatedAt = await domain.getLocalTime(clientId);
      const { id, itemIds, doneItemIds, ...left } = records;
      await crud('RecordChallenge').update({
        id,
        fields: {
          ...left,
          itemIds,
          doneItemIds,
          updatedAt,
        },
        noDeletedCheck: true,
      });
      return responseType.updated();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
