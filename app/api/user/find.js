({
  access: 'public',
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, email }) => {
    try {
      const result = await db('User').find('email', [ email.toLowerCase() ], [
        'id', 'email',
      ]);
      if (result.rows.length === 1) {
        const [ user ] = result.rows;
        return httpResponses.modifiedBodyTemplate(httpResponses.success, {
          user
        });
      }
      return httpResponses.modifiedBodyTemplate(httpResponses.success, {
        user: undefined
      });
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
