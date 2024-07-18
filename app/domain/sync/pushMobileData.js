async (pool, clientId, dataToSync, tableName) => {
  console.log('pushMobileData domain call:');
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

  const createRecords = async (rec) => {
    let serverId;
    const id = rec['id']; // id for mobile side    
    delete rec['id'];
    delete rec['serverId'];
    const convertedRec = convertToServerObj(rec);
    const value = common.validNumberValue(convertedRec.value) ?? convertedRec.value;
    const formattedRec = { ...convertedRec, value }    
    console.log('created formattedRec', formattedRec);
    if (tableName === 'ItemValue') {
      serverId = await domain.value.create(pool, clientId, formattedRec);
      await crud(tableName).update({
        id: serverId,
        fields: {
          createdAt: formattedRec.createdAt },
        transaction: pool
      });
    } else {
      const dbResult = await crud(tableName).create([formattedRec], pool);
      const [insertedResult] = dbResult && dbResult.rows;
      serverId = insertedResult.id;
    }
    return { id, serverId }    
  }

  let syncedCreatedCount = 0;
  let syncedUpdatedCount = 0;
  try {
    const resultCreatedSyncIds = [];
    const { created, updated, deleted } = dataToSync;
    const allUpdated = [...updated, ...deleted];
    if (created && created.length > 0) {
      for (const createdRec of created) {
        const { id, serverId } = await createRecords(createdRec);
        resultCreatedSyncIds.push({ id, serverId: Number(serverId) });
        syncedCreatedCount += 1;
      }
    }
    // console.log('PUSH updated', allUpdated);
    if (allUpdated && allUpdated.length > 0) {
      for (const updatedRec of allUpdated) {
        let mobileId;
        if (!updatedRec.serverId) { // Case when record is created and updated at once before syncing
          console.log('Case when record is created and updated at once, updatedRec\n');
          console.log(updatedRec);
          const { id, serverId } = await createRecords(updatedRec);
          resultCreatedSyncIds.push({ id, serverId: Number(serverId) });
          syncedCreatedCount += 1;
          updatedRec.serverId = serverId;
          mobileId = id;
        }        
        const formattedRec = convertToServerObj(updatedRec);
        console.log('formattedRec for server updating');
        console.log(formattedRec);
        const id = formattedRec.id;
        if (tableName === 'ItemValue') {
          const createdAt = formattedRec.createdAt;
          delete formattedRec.createdAt;
          await domain.value.update(pool, clientId, formattedRec)
          delete formattedRec.id;
          await crud(tableName).update({
            id,
            fields: {
              createdAt: createdAt,
              updatedAt: formattedRec.updatedAt },
            transaction: pool
          });
          syncedUpdatedCount += 1;          
        } else {
          delete formattedRec.id;
          await crud(tableName).update({ id, fields: { ...formattedRec }, transaction: pool});
          syncedUpdatedCount += 1;          
        }
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
    console.error('pushMobileData Error:\n');
    console.error(e);
    return { success: false };
  }
};
