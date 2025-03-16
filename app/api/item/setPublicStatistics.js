({
  method: async ({ ...records }) => {
    try {
      const statsId =
        await db.processTransaction(domain.item.setPublicStatistics, records);
      return responseType.modifiedBodyTemplate(responseType.created, {
        statsId,
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
