({
  method: async (id, password) => {
    const hash = await common.hashPassword(password);
    db('User').update(id, { password: hash });
    return { status: 'success' };
  },
});
