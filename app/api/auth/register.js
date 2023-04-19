({
  access: 'public',
  method: async ({ id, password }) => {
    try {
      const hash = await common.hashPassword(password);
      const result = await db('User').read(id);
      if (result.rows.length === 1) {
        await db('User').update(id, { password: hash });
        return httpResponses.success();
      }
      return httpResponses.notFound();
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
