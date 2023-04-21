({
  access: 'public',
  method: async ({ email }) => {
    try {
      const result = await db('User').find('email', [email.toLowerCase()], [
        'id', 'email',
      ]);
      if (result.rows.length === 1) {
        const [ user ] = result.rows;
        return { ...httpResponses.success(), body: { user } };
      }
      return { ...httpResponses.success(), body: { user: undefined } };
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
