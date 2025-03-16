async (pool, records) => {
  const { clientId, id, turnOn } = records;
  const updatedAt = await domain.getLocalTime(clientId);
  const hexId = !!turnOn && common.generateTempToken() || undefined;
  const fields = {
    userId: clientId,
    publicStatisticsId: hexId,
    updatedAt,
  };
  await crud('Item').update({ id, fields, transaction: pool });
  await crud('User').update({
    id: clientId,
    fields: { syncToMob: false },
    transaction: pool,
  });
  await domain.sync.updateSyncToFalse(pool, clientId);
  return hexId;
};
