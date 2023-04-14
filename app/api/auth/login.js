({
  method: async (email, password) => {
    const users =
      await db('User').find('email', email, ['id', 'email']);
    if (users.length === 0)
      throw new Error('Incorrect login or password');
    const { password: hash } = users[0];
    const valid = await api.common.validatePassword(password, hash);
    if (!valid) throw new Error('Incorrect login or password');
    const token = await api.common.generateToken();
    return { status: 'logged', token };
  },
});
