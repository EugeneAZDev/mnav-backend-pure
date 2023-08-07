({
  method: async ({ clientId, itemId }) => {
    try {
      const sql = `
        SELECT iv.value, iv."createdAt", i."valueType"
        FROM "ItemValue" iv
        JOIN "Item" i ON iv."itemId" = i.id
        LEFT JOIN "ItemSection" its ON its.id = i."sectionId" 
        WHERE	i."userId" = ${clientId} AND iv."itemId" = ${itemId} AND  iv."deletedAt" IS NULL
        ORDER BY iv."createdAt";
      `;
      const result = await crud().query(sql);
      if (result.rows.length > 0) {
        return responseType.modifiedBodyTemplate(responseType.success, {
          valueType: result.rows[0].valueType,
          values: result.rows.map(row => ({
            value: row.value,
            createdAt: row.createdAt
          }))
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        values: []
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  }
});
