/* eslint-disable max-len */
({
  method: async ({ clientId, itemId, pool }) => {
    try {
      const sql = `
        WITH sorted_data AS (
          SELECT
            DISTINCT ON (iv.value)
            iv.value AS title,
            iv."createdAt",
            ROW_NUMBER() OVER (PARTITION BY iv.value ORDER BY iv."createdAt" DESC) AS rn
          FROM "ItemValue" iv
          JOIN "Item" i ON iv."itemId" = i.id
          LEFT JOIN "ItemSection" its ON its.id = i."sectionId" 
          WHERE	i."userId" = ${clientId}
            AND iv."itemId" = ${itemId}
            AND  iv."deletedAt" IS NULL
            AND i."valueType" = 'text'
          ORDER BY iv.value, iv."createdAt" DESC
        )
        SELECT title
        FROM sorted_data
        WHERE rn = 1
        ORDER BY "createdAt" DESC;
      `;
      const result = await crud().query(sql, [], pool);
      const titles = result.rows.map((item) => item.title);
      if (result.rows.length > 0) {
        return responseType.modifiedBodyTemplate(responseType.success, {
          titles,
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        titles: [],
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
