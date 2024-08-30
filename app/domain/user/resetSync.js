async (pool, email) => {
  const result = await crud('User').select({
    fields: ['id'],
    where: { email },
    transaction: pool,
  });
  if (result.rows.length > 0) {
    const user = result.rows[0];
    await crud('User').update({
      id: user.id,
      fields: {
        deviceId: null,
        removedDeviceId: null,
        syncToMob: false,
        syncToServer: false,
      },
      transaction: pool,
    })
  }
  return true;
};
