async (pool, clientId, tableName, latestSyncDate) => {
  const basicQuery = `
    SELECT * FROM "${tableName}" s
    WHERE s."userId" = ${clientId} AND s."updatedAt" IS NOT NULL
      AND s."updatedAt" > TIMESTAMP '${latestSyncDate}' + INTERVAL '1 second'
    ORDER BY s."updatedAt" DESC;
  `;
  const itemValueQuery = `
    SELECT iv.* FROM "${tableName}" iv
      JOIN "Item" i ON iv."itemId" = i.id
      LEFT JOIN "ItemSection" its ON its.id = i."sectionId" 
    WHERE	i."userId" = ${clientId}     
      AND iv."updatedAt" > TIMESTAMP '${latestSyncDate}' + INTERVAL '1 second'
    ORDER BY 1, iv."updatedAt" DESC;
  `;
  const query = tableName === 'ItemValue' ? itemValueQuery : basicQuery;
  const result = await pool.query(query);
  return result;
}
