({
  method: async ({ clientId }) => {
    try {
      const sql = `
        SELECT i.* FROM "Item" i
        JOIN "ItemValue" iv ON i.id = iv."itemId"
        WHERE	i."userId" = ${clientId}
          AND i."deletedAt" IS NOT NULL
          AND iv."deletedAt" IS NULL
        GROUP BY i."id";
      `;
      const result = await crud().query(sql);
      if (result.rows.length > 0) {
        const items = result.rows;
        return responseType.modifiedBodyTemplate(responseType.success, {
          items
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        items: [],
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  }
});
