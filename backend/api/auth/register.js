({
  method: async ({ id, password }) => {
    console.log('HERE');
    const hash = await common.hashPassword(password);
    db('User').update(id, { password: hash });
    return { status: 'success' };
  },
});
