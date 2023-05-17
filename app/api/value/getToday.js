({
  method: async ({ clientId, id }) => {
    try {
      const sql = `
      SELECT iv.id, value
      FROM "ItemValue" iv
        JOIN "Item" i ON	iv."itemId" = i.id
      WHERE	i."userId" = ${clientId}
        AND i.id = ${id}
        AND DATE(iv."createdAt") = CURRENT_DATE;
      `;
      const result = await db().query(sql);
      if (result.rows.length > 0) {
        console.log(result.rows);
        const values = result.rows;
        return { ...httpResponses.success(), body: { values } };
      }
      return { ...httpResponses.success(), body: { values: [] } };
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  }
});
