({
  access: 'public',
  method: async ({ clientId, id, useClientId = true }) => {
    try {
      if (useClientId && !id) id = clientId;
      const result = await crud('User').select({
        id, fields: ['email', 'locale', 'updatedDetailsAt']
      });
      if (result.rows.length === 1) {
        const [user] = result.rows;
        return responseType.modifiedBodyTemplate(responseType.success, {
          user,
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        user: undefined,
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
