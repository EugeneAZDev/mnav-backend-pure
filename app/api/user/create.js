({
  access: 'public',
  method: async ({ ...records }) => {
    try {
      const result = await db('User').create({ ...records });
      const [ user ] = result.rows;
      return {
        ...httpResponses.created(),
        body: {
          ...httpResponses.created().body,
          userId: user.id,
        },
      };
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
