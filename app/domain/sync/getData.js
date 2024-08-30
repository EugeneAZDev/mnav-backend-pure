async (pool, clientId, tableName, localTime, param) => {
  const basicQuery = `
    SELECT * FROM "${tableName}" s
    WHERE s."userId" = ${clientId} AND s."${param}At" IS NOT NULL
      AND s."${param}At" > '${localTime}' AND s."deletedAt" IS NULL
    ORDER BY s."${param}At" DESC;
  `;
  const itemValueQuery = `
    SELECT iv.* FROM "${tableName}" iv
      JOIN "Item" i ON iv."itemId" = i.id
      LEFT JOIN "ItemSection" its ON its.id = i."sectionId" 
    WHERE	i."userId" = ${clientId}     
      AND iv."${param}At" > '${localTime}'
      AND iv."deletedAt" IS NULL
    ORDER BY 1, iv."${param}At" DESC;
  `;
  const query = tableName === 'ItemValue' ? itemValueQuery : basicQuery;
  // console.log('\nQuery of getData', tableName, query)
  const result = await pool.query(query);
  return result;
}
