async (pool, records) => {
  const { clientId, id, turnOn } = records;
  const updatedAt = await domain.getLocalTime(clientId);
  const hexId = !!turnOn && common.generateTempToken() || undefined;
  const fields = {
    userId: clientId,
    publicStatisticsId: hexId,
    updatedAt,
  };
  if (turnOn) {
    await crud('View').create([{ id: hexId }], pool);
  } else {
    const itemQuery = await crud('Item').select({ id });
    const [item] = itemQuery.rows;
    const sql = 'DELETE FROM "View" v WHERE v.id = $1;';
    await crud().query(sql, [item?.publicStatisticsId], pool);
  }
  await crud('Item').update({ id, fields, transaction: pool });
  await crud('User').update({
    id: clientId,
    fields: { syncToMob: false },
    transaction: pool,
  });
  await domain.sync.updateSyncToFalse(pool, clientId);
  return hexId;
};
