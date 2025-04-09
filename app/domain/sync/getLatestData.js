async (pool, clientId, tableName, localDates, mobVersion) => {
  const getDataFlow = async (param) => {
    const latest =
      await domain.sync.getLatestDates(pool, clientId, tableName, param);
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
        param
      );
      const ids = result.rows.map((item) => item.id);
      /**
       * TEMP implementation: mob code version 13
       */
      let modifiedResult = [];
      if ((mobVersion < 14 || !mobVersion) && tableName === 'Item') {
        const newResult =
          // eslint-disable-next-line no-unused-vars
          result.rows.map(({ publicStatisticsId, ...rest }) => rest);
        modifiedResult = newResult;
      } else {
        modifiedResult = result.rows;
      }
      // END BLOCK

      return {
        ids,
        result: modifiedResult,
        latest
      };
    } else return { ids: [], result: [] };
  };
  const getResultByIds = (resultList, idArray) =>
    resultList.filter((item) => idArray.includes(item.id));
  const preCreated = await getDataFlow('created');
  const preUpdated = await getDataFlow('updated');
  const createdIds = preCreated.ids.filter((id) =>
    !preUpdated.ids.includes(id)
  );
  const updated = getResultByIds(preUpdated.result, preUpdated.ids);
  const created = getResultByIds(preCreated.result, createdIds);
  const updatedLocalDates = {
    created: preCreated.latest,
    updated: preUpdated.latest,
  };
  return {
    created,
    updated,
    updatedLocalDates
  };
};
