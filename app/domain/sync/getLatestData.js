async (pool, clientId, tableName, localDates) => {
  const getLatestDates = async (param) => {
    const basicQuery = `
      SELECT "${param}At" FROM "${tableName}" s
      WHERE s."userId" = ${clientId} AND s."${param}At" IS NOT NULL
      ORDER BY s."${param}At" DESC LIMIT 1;
    `;
    const itemValueQuery = `
      SELECT iv."${param}At" FROM "${tableName}" iv
        JOIN "Item" i ON iv."itemId" = i.id
        LEFT JOIN "ItemSection" its ON its.id = i."sectionId" 
      WHERE	i."userId" = ${clientId}
      ORDER BY iv."${param}At" DESC LIMIT 1;
    `;
    const query = tableName === 'ItemValue' ? itemValueQuery : basicQuery;
    const queryResult = await pool.query(query);
    // TODO Left as previous for debugging, modify later
    if (queryResult.rows.length > 0) {
      const { [`${param}At`]: timestamp } = queryResult.rows[0];      
      return timestamp;
    } else return undefined;
  };

  const getData = async (param, latestTime, localTime) => {    
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
  };
  
  const getDataFlow = async (param) => {
    const latest = await getLatestDates(param);
    const latestTime = !!latest && new Date(latest).toISOString();
    const localTime = new Date(localDates[param]).toISOString();

    const latestDate = new Date(latestTime);
    const localDate = new Date(localTime);

    if (latestDate.getTime() !== localDate.getTime()) {
      const result = await getData(param, latestTime, localTime);
      const ids = result.rows.map(item => item.id);
      return { ids, result: result.rows, latest };  
    } else return { ids: [], result: [] }
  };

  const getResultByIds = (resultList, idArray) => resultList.filter(item => idArray.includes(item.id));

  const preCreated = await getDataFlow('created');
  const preDeleted = await getDataFlow('deleted');
  const preUpdated = await getDataFlow('updated');

  const updatedIds = preUpdated.ids.filter(id => !preDeleted.ids.includes(id));
  const createdWithoutDeletedIds = preCreated.ids.filter(id => !preDeleted.ids.includes(id));
  const createdIds = createdWithoutDeletedIds.filter(id => !preUpdated.ids.includes(id));

  const updated = getResultByIds(preUpdated.result, updatedIds);
  const created = getResultByIds(preCreated.result, createdIds);
  const deleted = preDeleted.result;

  const updatedLocalDates = {
    created: preCreated.latest,
    updated: preUpdated.latest,
    deleted: preDeleted.latest
  }

  return {
    created,
    deleted,
    updated,
    updatedLocalDates
  }
};
