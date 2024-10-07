async (pool, clientId, email, fullReset) => {
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
  const fields = {
    deviceId: null,
    removedDeviceId: null,
    syncToMob: false,
    syncToServer: false,
    syncProcess: false,
  };
  if (fullReset) fields.turnOffSync = false;
  userId && await crud('User').update({
    id: userId,
    fields,
    transaction: pool,
  });

  return true;
};
