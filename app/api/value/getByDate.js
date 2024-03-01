({
  method: async ({ clientId, id, date }) => {
    try {
      const localTime = await domain.getLocalTime(clientId, date);
      const localDateArr = new Date(localTime).toLocaleDateString().split('T')[0].split('/');
      const localDate = `${localDateArr[2]}-${localDateArr[0]}-${localDateArr[1]}`;
      // const localDate = new Date(localTime).toISOString().split('T')[0];
      const idCondition = id ? `AND i.id = ${id}` : '';
      const sql = `
        SELECT iv.id, value, iv."itemId"
        FROM "ItemValue" iv
          JOIN "Item" i ON	iv."itemId" = i.id
        WHERE	i."userId" = ${clientId}
          ${idCondition}
          AND DATE(iv."createdAt") = '${localDate}'
          AND iv."deletedAt" IS NULL;
        `;
      const result = await crud().query(sql);
      if (result.rows.length > 0) {
        const values = result.rows;
        return responseType.modifiedBodyTemplate(responseType.success, {
          values,
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        values: [],
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
