async (pool, records, restore) => {
  const { clientId, id, target, ...data } = records;
  const updatedAt = await domain.getLocalTime(clientId);
  const validTarget = target ? common.validNumberValue(target) : undefined;
  const fields = {
    userId: clientId,
    updatedAt,
    ...data,
  };
  if (target) {
    fields.target = validTarget;
  }
  if (restore) {
    fields.deletedAt = null;
  }
  await crud('Item').update({
    id,
    fields,
    restore,
    transaction: pool,
  });
  await crud('User').update({
    id: clientId,
    fields: {
      syncToMob: false,
    },
    transaction: pool,
  });
  await domain.sync.updateSyncToFalse(pool, clientId);
};
