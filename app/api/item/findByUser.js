({
  method: async ({ clientId }) => {
    try {
      const sql = `
        SELECT * FROM "Item" i
        WHERE i."userId" = '${clientId}' AND i."deletedAt" IS NULL
        ORDER BY i."sectionId" DESC, 1
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
  },
});
