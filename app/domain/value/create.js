async (pool, clientId, records) => {
  await domain.sync.updateSyncToFalse(pool, clientId);
  
  const { itemId, value } = records;
  const itemInfo = { itemId };
  if (typeof value === 'string') itemInfo['title'] = value;
  const valueDetails = await crud('ValueDetail').select({
    where: itemInfo,
    transaction: pool,
  });

  const inputDate = records.createdAt && new Date(records.createdAt);
  const localDate = await domain.getLocalTime(clientId, inputDate);
  const createdAt = localDate || (await domain.getLocalTime(clientId));
  const createdValueResult = await crud('ItemValue').create([{ ...records, createdAt }], pool);
  const [createdValue] = createdValueResult && createdValueResult.rows;
  
  const details = { ...itemInfo, latestAt: createdAt };
  if (valueDetails.rows.length) {
    const existingRec = valueDetails.rows[0];
    await crud('ValueDetail').update({
      id: existingRec.id,
      fields: details,
      transaction: pool,
    });
  } else {
    await crud('ValueDetail').create([details], pool);
  }

  return createdValue.id;
};
