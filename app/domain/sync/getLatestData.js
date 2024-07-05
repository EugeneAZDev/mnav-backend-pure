async (pool, clientId, tableName, localDates) => {
  const getDataFlow = async (param) => {
    const latest = await domain.sync.getLatestDates(pool, clientId, tableName, param);
    const latestTime = !!latest && new Date(latest).toISOString();
    const localTime = new Date(localDates[param]).toISOString();

    const latestDate = new Date(latestTime);
    const localDate = new Date(localTime);
    
    if (latestDate.getTime() > localDate.getTime()) {
      const result = await domain.sync.getData(
        pool,
        clientId,
        tableName,
        localTime,
        latestTime,
        param
      );
      const ids = result.rows.map(item => item.id);      
      // console.log( // DEBUG INFO
      //   'getLatestData domain function:\n',
      //   '\n\tlatestTime', latestDate.getTime(), 
      //   '\n\tlocalTime', localDate.getTime(), 
      //   '\n\tboolCompareTimeResult', (latestDate.getTime() > localDate.getTime()), 
      //   '\n\ttableName', tableName,
      //   '\n\tlatest', latestDate,
      //   '\n\tlocal', localDate,
      //   '\n\n'
      // );
      return { ids, result: result.rows, latest };
    } else return { ids: [], result: [] }
  };

  const getResultByIds = (resultList, idArray) => resultList.filter(item => idArray.includes(item.id));

  const preCreated = await getDataFlow('created');  
  const preUpdated = await getDataFlow('updated');
  const preDeleted = await getDataFlow('deleted');
  
  const updatedIds = preUpdated.ids.filter(id => !preDeleted.ids.includes(id));
  const createdWithoutDeletedIds = preCreated.ids.filter(id => !preDeleted.ids.includes(id));
  const createdIds = createdWithoutDeletedIds.filter(id => !preUpdated.ids.includes(id));

  const updated = getResultByIds(preUpdated.result, updatedIds);
  const created = getResultByIds(preCreated.result, createdIds);
  const deleted = preDeleted.result;

  if (tableName === 'ItemValue') {
    console.log( // DEBUG INFO
    '\n', 'preCreated', preCreated.ids.length, '\n',
    'preUpdated', preUpdated.ids.length, '\n',
    'preDeleted', preDeleted.ids.length, '\n',
    '\ncreatedIds', createdIds.length, '\n',
    '\nupdatedIds', updatedIds.length, '\n',
    '\ndeletedIds', preDeleted.ids.length,
    );
  }

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
