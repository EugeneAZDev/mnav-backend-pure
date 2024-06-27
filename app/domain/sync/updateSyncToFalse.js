async (pool, clientId) => {
  const result = await crud('User').select({
    id: clientId,
    fields: ['syncToMob'],
    tansaction: pool
  });
  if (result && result.rows.length === 1) {
    const { syncToMob } = result.rows[0];
    if (syncToMob) {
    await crud('User').update({
      id: clientId,
      fields: { syncToMob: false },
      transaction: pool,
    })}}
};
