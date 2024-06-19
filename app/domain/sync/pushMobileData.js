async (pool, clientId, dataToSync, tableName) => {
  const convertToServerObj = (obj) => {
      const newObj = { ...obj };
      Object.keys(newObj).forEach(key => {
        if (key.startsWith('server')) {
          const newKey = key.charAt(6).toLowerCase() + key.slice(7);
          newObj[newKey] = newObj[key];
          delete newObj[key];
        }
      });
      return newObj;
  };

  let syncedCreatedCount = 0;
  let syncedUpdatedCount = 0;
  try {
    const resultCreatedSyncIds = [];
    const { created, updated, deleted } = dataToSync;
    const allUpdated = [...updated, ...deleted];
    console.log('PUSH created', created);
    if (created && created.length > 0) {
      for (const createdRec of created) {
        const id = createdRec['id']; // id for mobile side
        delete createdRec['id'];
        delete createdRec['serverId'];
        const formattedRec = convertToServerObj(createdRec);
        const dbResult = await crud(tableName).create([formattedRec], pool);
        const [insertedResult] = dbResult && dbResult.rows;
        resultCreatedSyncIds.push({ id, serverId: Number(insertedResult.id) });
        syncedCreatedCount += 1;
      }
    }
    console.log('PUSH updated', allUpdated);
    if (allUpdated && allUpdated.length > 0) {
      for (const updatedRec of allUpdated) {
        const formattedRec = convertToServerObj(updatedRec);
        const id = formattedRec.id;
        delete formattedRec.id;
        console.log({ id, fields: { ...formattedRec }});
        const dbResult = await crud(tableName).update({ id, fields: { ...formattedRec }});
        if (dbResult && dbResult.rowsCount > 0) syncedUpdatedCount += dbResult.rowsCount;      
      }  
    }
  
    return { 
      success: true,
      resultCreatedSyncIds,
      updatedLocalDates: dataToSync.latestDates,
      syncedCreatedCount,
      syncedUpdatedCount,
    };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
};
