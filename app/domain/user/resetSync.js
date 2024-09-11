async (pool, clientId, email) => {
  let userId;
  if (clientId) {
    userId = clientId;
  } else {
    const result = await crud('User').select({
      fields: ['id'],
      where: { email },
      transaction: pool,
    });
    if (result.rows.length > 0) {
      const user = result.rows[0];
      userId = user.id;
    }
  }
  console.debug('Rest sync for userId', userId);
  userId && await crud('User').update({
    id: userId,
    fields: {
      deviceId: null,
      removedDeviceId: null,
      syncToMob: false,
      syncToServer: false,
      syncProcess: false,
      turnOffSync: false,
    },
    transaction: pool,
  });

  return true;
};
