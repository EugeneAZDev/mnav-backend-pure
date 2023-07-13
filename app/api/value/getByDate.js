({
  method: async ({ clientId, id, date }) => {
    try {
      const idCondition = id ? `AND i.id = ${id}` : '';
      const sql = `
        SELECT iv.id, value, iv."itemId"
        FROM "ItemValue" iv
          JOIN "Item" i ON	iv."itemId" = i.id
        WHERE	i."userId" = ${clientId}
          ${idCondition}
          AND DATE(iv."createdAt") = '${date}'
          AND iv."deletedAt" IS NULL;
        `;
      const result = await crud().query(sql);
      if (result.rows.length > 0) {
        const values = result.rows;
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
