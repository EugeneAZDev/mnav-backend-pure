({
  access: 'public',
  method: async ({ email, password }) => {
    try {
      const result = await db('User').find('email', email.toLowerCase());
      if (result.rows.length === 1) {
        const [ user ] = result.rows;
        const valid = await common.validatePassword(password, user.password);
        if (valid) {
          const token = await common.generateToken(user.id);
          return { ...httpResponses.success(), body: { token } };
        }
      }
      return httpResponses.unauthorized();
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
