async (pool, clientId, tableName, localTime, latestTime, param) => {
  const basicQuery = `
    SELECT * FROM "${tableName}" s
    WHERE s."userId" = ${clientId} AND s."${param}At" IS NOT NULL
      AND s."${param}At" > '${localTime}' AND s."${param}At" <= TIMESTAMP '${latestTime}' + INTERVAL '1 day'
    ORDER BY s."${param}At" DESC;
  `;
  const itemValueQuery = `
    SELECT iv.* FROM "${tableName}" iv
      JOIN "Item" i ON iv."itemId" = i.id
      LEFT JOIN "ItemSection" its ON its.id = i."sectionId" 
    WHERE	i."userId" = ${clientId} AND iv."deletedAt" IS NULL
    ORDER BY 1, iv."createdAt"
  `; // Getting only active values due to the large number
  const query = tableName === 'ItemValue' ? itemValueQuery : basicQuery;
  const result = await pool.query(query);
  return result;
}
