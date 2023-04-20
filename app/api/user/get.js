({
  method: async ({ id }) => {
    try {
      const result = await db('User').read(id, ['id', 'email']);
      if (result.rows.length === 1) {
        const [ user ] = result.rows;
        return { ...httpResponses.success(), body: { user } };
      }
      return { ...httpResponses.success(), body: { user: undefined } };
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  }
});
