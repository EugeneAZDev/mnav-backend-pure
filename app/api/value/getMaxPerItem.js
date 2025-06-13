({
  method: async ({ clientId, fromDate, itemIds }) => {
    try {
      const sql = `
       SELECT
            DATE_TRUNC('day', iv."createdAt") AS "date",
            iv."itemId",
            SUM(iv.value::NUMERIC) AS "value"
        FROM "ItemValue" iv
        JOIN "Item" i ON iv."itemId" = i.id
        WHERE i."userId" = ${clientId}
          AND iv."itemId" IN (${itemIds})
          AND iv."createdAt" >= ('${fromDate}'::DATE - INTERVAL '1 day')
          AND iv."deletedAt" IS NULL
        GROUP BY
            DATE_TRUNC('day', iv."createdAt"),
            iv."itemId"
        ORDER BY
            "date",
            iv."itemId";
      `;
      const result = await crud().query(sql, []);
      if (result.rows.length > 0) {
        return responseType.modifiedBodyTemplate(responseType.success, {
          values: result.rows
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        values: [],
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
