({
  method: async ({ clientId }) => {
    try {
      const sql = `
        SELECT * FROM "Calories" c WHERE	c."userId" = ${clientId}
        ORDER BY c."createdAt";
      `;
      const result = await crud().query(sql);
      if (result.rows.length > 0) {
        const calories = result.rows;
        return responseType.modifiedBodyTemplate(responseType.success, {
          calories
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        calories: []
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  }
});
