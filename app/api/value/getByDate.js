({
  method: async ({ clientId, id, date, daysCount, graph }) => {
    try {
      const localTime = await domain.getLocalTime(clientId, date);
      const localDate = graph ?
        new Date(date.slice(0, 10)).toISOString() :
        new Date(localTime).toISOString().split('T')[0];
      console.log( // TODO DEBUG TEMP LINE
        '\ndate', date,
        '\nlocalDate', localDate,
      );
      const idCondition = id ? `AND i.id = ${id}` : '';
      let datesCondition = `AND DATE(iv."createdAt") = '${localDate}'`;
      let createdAt = '';
      if (daysCount && daysCount > 1) {
        const secondDateTime = new Date(date);
        secondDateTime.setDate(secondDateTime.getDate() + daysCount);
        const secondDate = secondDateTime.toISOString().slice(0, 10);
        // eslint-disable-next-line max-len
        datesCondition = `AND DATE(iv."createdAt") >= '${localDate}' AND DATE(iv."createdAt") <= '${secondDate}'`;
        // eslint-disable-next-line quotes
        createdAt = `, iv."createdAt"`;
      }
      const sql = `
        SELECT iv.id, value, iv."itemId"${createdAt}
        FROM "ItemValue" iv
          JOIN "Item" i ON	iv."itemId" = i.id
        WHERE	i."userId" = ${clientId}
          ${idCondition}
          ${datesCondition}
          AND iv."deletedAt" IS NULL;
        `;
      // console.log( // DEBUG INFO
      //   '\n\tdate', date,
      //   '\n\tdaysCount', daysCount,
      //   '\n\tlocalTime', localTime,
      //   '\n\tlocalDate', localDate,
      //   '\n\tsql', sql,
      // );
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
