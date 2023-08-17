({
  method: async ({ itemIds, full = false }) => {
    try {
      const fields = !full ? ['id', 'itemId', 'latestAt', 'title'] : undefined;
      if (itemIds && itemIds.length > 0) {
        const result = await crud('ValueDetail').select({
          fields,
          where: { itemId: itemIds },
        });
        if (result.rows.length > 0) {
          return responseType.modifiedBodyTemplate(responseType.success, {
            detailsList: result.rows,
          });
        }
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        detailsList: undefined,
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
