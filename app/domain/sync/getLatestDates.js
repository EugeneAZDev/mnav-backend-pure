async (pool, clientId, tableName, localDates) => {
  const getLatestDates = async (param) => {
    const query = `
      SELECT "${param}At" FROM "${tableName}" s
      WHERE s."userId" = ${clientId} AND s."${param}At" IS NOT NULL
      ORDER BY s."${param}At" DESC LIMIT 1;
    `;
    const { [`${param}At`]: timestamp } = (await pool.query(query)).rows[0];
    return timestamp;
  };

  const getData = async (param, latestTime, localTime) => {
    const query = `
      SELECT * FROM "${tableName}" s
      WHERE s."userId" = ${clientId} AND s."${param}At" IS NOT NULL
        AND s."${param}At" > '${localTime}' AND s."${param}At" <= TIMESTAMP '${latestTime}' + INTERVAL '1 day'
      ORDER BY s."${param}At" DESC;
    `;
    const result = await pool.query(query);
    return result;
  };
  
  const getDataFlow = async (param) => {
    const latest = await getLatestDates(param);
    const latestTime = new Date(latest).toISOString();
    const localTime = new Date(localDates[param]).toISOString();
    const result = await getData(param, latestTime, localTime);
    const ids = result.rows.map(item => item.id);
    return { ids, result: result.rows };
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

  return {
    created,
    deleted,
    updated
  }
}
