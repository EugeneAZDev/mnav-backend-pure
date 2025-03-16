async (pool, clientId, tableName, param) => {
  const basicQuery = `
    SELECT "${param}At" FROM "${tableName}" s
    WHERE s."userId" = ${clientId}
      AND s."${param}At" IS NOT NULL
      AND s."deletedAt" IS NULL
    ORDER BY s."${param}At" DESC LIMIT 1;
  `;
  const itemValueQuery = `
    SELECT iv."${param}At" FROM "${tableName}" iv
      JOIN "Item" i ON iv."itemId" = i.id
      LEFT JOIN "ItemSection" its ON its.id = i."sectionId"
    WHERE	i."userId" = ${clientId}
      AND iv."${param}At" IS NOT NULL
      AND iv."deletedAt" IS NULL
    ORDER BY iv."${param}At" DESC LIMIT 1;
  `;
  const query = tableName === 'ItemValue' ? itemValueQuery : basicQuery;
  const queryResult = await pool.query(query);
  // if (tableName === 'ItemValue') // DEBUG INFO
  //   console.log(
  //     'query', query, '\n',
  //     'queryResult', queryResult && queryResult.rows, '\n',
  //   );
  // TODO Left for debugging, modify later
  if (queryResult.rows.length > 0) {
    const { [`${param}At`]: timestamp } = queryResult.rows[0];
    return timestamp;
  } else return undefined;
};
