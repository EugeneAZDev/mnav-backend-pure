({
  access: 'public',
  method: async ({ ...records }) => {
    try {
      const itemAndDetails =
        await db.processTransaction(domain.item.getPublicStatistics, records);
      return responseType.modifiedBodyTemplate(responseType.success, {
        itemInfo: itemAndDetails?.item,
        statistics: itemAndDetails?.details,
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
