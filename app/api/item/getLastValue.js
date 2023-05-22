({
  method: async ({ id }) => {
    try {
      const sql = `
        SELECT value FROM "ItemValue" iv 
        WHERE "itemId" = ${id} AND "deletedAt" IS NULL 
        ORDER BY "createdAt" DESC LIMIT 1;`;
      const result = await db().query(sql);
      if (result.rows.length > 0) {
        return httpResponses.modifiedBodyTemplate(httpResponses.success, {
          lastValue: result.rows[0].value,
        });
      }
      return httpResponses.modifiedBodyTemplate(httpResponses.success, {
        lastValue: undefined,
      });
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
