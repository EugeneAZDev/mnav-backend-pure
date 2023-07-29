({
  method: async ({ clientId, itemId }) => {
    try {
      const sql = `
        SELECT iv.value
        FROM "ItemValue" iv
        JOIN "Item" i ON iv."itemId" = i.id
        LEFT JOIN "ItemSection" its ON its.id = i."sectionId" 
        WHERE	i."userId" = ${clientId} AND iv."itemId" = ${itemId} AND  iv."deletedAt" IS NULL
        ORDER BY 1, iv."createdAt";
      `;
      const result = await crud().query(sql);
      if (result.rows.length > 0) {
        const values = result.rows.map(item => item.value);
        return responseType.modifiedBodyTemplate(responseType.success, {
          values
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
