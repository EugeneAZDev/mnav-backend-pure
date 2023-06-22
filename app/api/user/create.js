({
  access: 'public',
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, ...records }) => {
    try {
      const result = await crud('User').create([{ ...records }]);
      const [ user ] = result.rows;
      return responseType.modifiedBodyTemplate(responseType.created, {
        id: user.id
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
