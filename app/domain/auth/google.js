async (pool, googleUserId, email) => {
  const result = await crud('User').select({
    where: { email: email.toLowerCase() },
    transaction: pool,
  });
  let user;
  if (result && result.rows.length === 1) {
    user = result.rows[0];
    if (!user?.gAuthId) {
      const result = await crud('User').update({
        id: user.id,
        fields: {
          gAuthId: googleUserId,
        },
        transaction: pool,
      });
      console.log(result.rows[0]);
    }
  } else {
    const result = await crud('User').create([{
      email: email.toLowerCase(),
      gAuthId: googleUserId,
    }], pool);
    user = result.rows[0];
  }
  return user.id;
};
