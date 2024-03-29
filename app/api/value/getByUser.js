({
  method: async ({ clientId }) => {
    try {
      const sql = `
        SELECT  i.id AS "itemId", its.id AS "sectionId", iv.id AS "valueId",
                its.title AS "section", i."valueType", i."valueAssessment",
                i.title, i.description, i.target, iv.value, iv."createdAt"
        FROM "ItemValue" iv
        JOIN "Item" i ON iv."itemId" = i.id
        LEFT JOIN "ItemSection" its ON its.id = i."sectionId" 
        WHERE	i."userId" = ${clientId} AND iv."deletedAt" IS NULL
        ORDER BY 1, iv."createdAt";
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
