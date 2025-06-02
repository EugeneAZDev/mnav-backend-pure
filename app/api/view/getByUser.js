({
  method: async ({ clientId }) => {
    try {
      const sql =
        `SELECT * FROM "Item" i
         WHERE
          i."userId" = ${clientId} AND
          i."publicStatisticsId" IS NOT NULL AND
          i."deletedAt" IS NULL`;
      const queryResult = await crud().query(sql);
      if (queryResult?.rows?.length > 0) {
        return responseType.modifiedBodyTemplate(responseType.success, {
          items: queryResult.rows
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        items: []
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
