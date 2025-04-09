({
  access: 'public',
  method: async ({ ...records }) => {
    try {
      const itemAndDetails =
        await db.processTransaction(domain.item.getPublicStatistics, records);
      return responseType.modifiedBodyTemplate(responseType.success, {
        itemInfo: itemAndDetails?.item,
        statistics: itemAndDetails?.details,
        totalRecordsCount: itemAndDetails?.totalRecordsCount || 0,
        views: itemAndDetails?.views || 0,
        maxRecordTotalObj: itemAndDetails?.maxRecordTotalObj || {},
        maxRecordCountObj: itemAndDetails?.maxRecordCountObj || {},
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
