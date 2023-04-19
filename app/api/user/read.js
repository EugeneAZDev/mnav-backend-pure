({
  method: async ({ id }) => {
    try {
      const user = (await db('User').read(id, ['id', 'email'])).rows[0];
      return {
        code: 201,
        body: { id: user.id },
      };
    } catch (error) {
      return {
        code: 500,
        body: { error: 'Internal Server Error' },
        error
      };
    }
  }
});
