({
  access: 'public',
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, ...args }) => {
    const email = args && args.email;
    const token = args && args.token;
    const field = email ? 'email' : 'token';
    const value = email || token;

    try {
      const result = await crud('User').find(field, [ value.toLowerCase() ], [
        'id', 'email', 'password'
      ]);
      if (result.rows.length === 1) {
        const [ user ] = result.rows;
        if (user.password !== null) {
          user.password = undefined;
        }
        return responseType.modifiedBodyTemplate(responseType.success, {
          user
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        user: undefined
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
