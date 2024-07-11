async (pool, records) => {
  const { clientId, id, target, ...data } = records;
  const updatedAt = await domain.getLocalTime(clientId);
  const validTarget = target ? common.validNumberValue(target) : undefined;
  await crud('Item').update({
    id,
    fields: {
      userId: clientId,
      target: validTarget,
      updatedAt,
      ...data,
    },
    transaction: pool,
  });  
  await crud('User').update({
    id: clientId,
    fields: {
      syncToServer: false,
    },
    transaction: pool,
  });
};
