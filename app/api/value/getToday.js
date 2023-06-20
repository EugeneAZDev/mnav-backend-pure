({
  method: async ({ clientId, id }) => {
    try {
      const sql = `
      SELECT iv.id, value
      FROM "ItemValue" iv
        JOIN "Item" i ON	iv."itemId" = i.id
      WHERE	i."userId" = ${clientId}
        AND i.id = ${id}
        AND DATE(iv."createdAt") = CURRENT_DATE
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
        value: []
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  }
});
