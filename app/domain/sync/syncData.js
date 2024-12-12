async (pool, clientId, tableName, syncDate, recordsToUpdate) => {
  const statistics = {
    crossed: 0,
    server: 0,
    mobile: 0
  };
  const createdMobItems = [];  
  const mobUpdateList = [];
  const serverCreateList = [];
  const serverUpdateList = [];
  const serverHandledIds = [];
  const serverRecsDbResult = await domain.sync.getRecords(pool, clientId, tableName, syncDate);
  const serverRecordsToUpdate = serverRecsDbResult.rows;
  const serverRecordToUpdateIds = serverRecordsToUpdate.map(rec => Number(rec.id));
  let latestUpdatedAt = new Date(syncDate);

  // Mobile records
  Promise.all(
    recordsToUpdate.map(async (rec) => {
      if (new Date(rec.updatedAt) > latestUpdatedAt) latestUpdatedAt = new Date(rec.updatedAt);
      const mobConvertedRec = domain.sync.convertToServerObj(rec);
      if (mobConvertedRec.id && serverRecordToUpdateIds.includes(mobConvertedRec.id)) {
        statistics.crossed += 1;
        serverHandledIds.push(mobConvertedRec.id);
        const serverRec = serverRecordsToUpdate.find(rec => Number(rec.id) === mobConvertedRec.id);
        if (new Date(mobConvertedRec.updatedAt) > serverRec.updatedAt) {
          serverUpdateList.push(mobConvertedRec);
        } else {          
          const mobRec = {
            ...serverRec,
            id: rec.id,
            serverId: serverRec.id,
          }
          if (serverRec.sectionId) {
            mobRec['sectionId'] = rec.sectionId;
            mobRec['serverSectionId'] = serverRec.sectionId;
          }
          if (serverRec.itemId) {
            mobRec['itemId'] = rec.itemId;
            mobRec['serverItemId'] = serverRec.itemId;
          }
          mobUpdateList.push(mobRec);
        }
      } else {
        statistics.server += 1;
        if (!mobConvertedRec.id) {
          serverCreateList.push(mobConvertedRec);
          createdMobItems.push(rec);
        } else serverUpdateList.push(mobConvertedRec);
      }
    })
  );  

  const leftServerRecordsIds = serverRecordToUpdateIds.filter(element => !serverHandledIds.includes(element));

  // Left server records
  Promise.all(
    serverRecordsToUpdate.map(async (rec) => {
      if (new Date(rec.updatedAt) > latestUpdatedAt) latestUpdatedAt = new Date(rec.updatedAt);
      if (leftServerRecordsIds.includes(Number(rec.id))) {
        const mobRec = {
          ...rec,
          id: null,
          serverId: rec.id,
        }
        if (rec.sectionId) {
          mobRec['sectionId'] = null;
          mobRec['serverSectionId'] = rec.sectionId;
        }
        if (rec.itemId) {
          mobRec['itemId'] = null;
          mobRec['serverItemId'] = rec.itemId;
        }
        mobUpdateList.push(mobRec);
        statistics.mobile += 1;
      } else return;
    }),
  );  
  
  // Server created records
  for (const [index, rec] of serverCreateList.entries()) {
    if (new Date(rec.updatedAt) > latestUpdatedAt) latestUpdatedAt = new Date(rec.updatedAt);
    let serverId;
    delete rec['id'];
    const value = common.validNumberValue(rec.value) ?? rec.value;      
    if (value) rec['value'] = value;
    // console.log('rec', rec); // TODO DEBUG TEMP LINE
    if (tableName === 'ItemValue') {      
      serverId = await domain.value.create(pool, clientId, rec);
      // console.log('server create rec Id', serverId); // TODO DEBUG TEMP LINE
      if (serverId) {
        await crud(tableName).update({
          id: serverId,
          fields: {
            createdAt: rec.createdAt,
            updatedAt: rec.updatedAt
          },
          transaction: pool
        });
      }
    } else {
      const dbResult = await crud(tableName).create([rec], pool);
      const [insertedResult] = dbResult && dbResult.rows;
      serverId = insertedResult.id;
    }
    const mobRec = {
      ...createdMobItems[index],
      serverId
    }
    mobUpdateList.push(mobRec);
  }
  
  // Server updated records
  for (const rec of serverUpdateList) {
    if (new Date(rec.updatedAt) > latestUpdatedAt) latestUpdatedAt = new Date(rec.updatedAt);
    const id = rec.id;
    if (tableName === 'ItemValue') {
      const createdAt = rec.createdAt;
      delete rec.createdAt;
      await domain.value.update(pool, clientId, rec);
      delete rec.id;
      await crud(tableName).update({
        id,
        fields: {
          createdAt,
          updatedAt: rec.updatedAt },
        transaction: pool
      });
    } else {
      delete rec.id;
      await crud(tableName).update({ id, fields: { ...rec }, transaction: pool});
    }
  }

  return {
    newSyncDate: latestUpdatedAt,
    recordsToUpdate: mobUpdateList,
    statistics
  }
};
