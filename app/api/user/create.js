({
  access: 'public',
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, ...records }) => {
    try {
      const result = await db('User').create({ ...records });
      const [ user ] = result.rows;
      return responseType.modifiedBodyTemplate(responseType.created, {
        userId: user.id
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
