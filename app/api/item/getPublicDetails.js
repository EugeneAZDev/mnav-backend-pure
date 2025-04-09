({
  access: 'public',
  method: async ({ itemId }) => {
    try {
      const result = await crud('ItemValue').select({
        where: { itemId },
        orderBy: {
          fields: ['createdAt'],
          order: 'ASC',
        },
        limit: 1,
      });
      if (result.rows.length === 1) {
        return responseType.modifiedBodyTemplate(responseType.success, {
          details: {
            createdAt: result.rows[0].createdAt,
          }
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        details: undefined
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  }
});
