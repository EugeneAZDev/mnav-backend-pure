({
  method: async ({ clientId, itemId, pool }) => {
    try {
      const sql = `
        SELECT DISTINCT iv.value AS title
        FROM "ItemValue" iv
        JOIN "Item" i ON iv."itemId" = i.id
        LEFT JOIN "ItemSection" its ON its.id = i."sectionId" 
        WHERE	i."userId" = ${clientId}
          AND iv."itemId" = ${itemId}
          AND  iv."deletedAt" IS NULL
          AND i."valueType" = 'text'
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
