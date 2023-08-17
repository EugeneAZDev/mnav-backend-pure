({
  method: async ({ id }) => {
    try {
      const result = await crud('User').select({ id, fields: ['id', 'email'] });
      if (result.rows.length === 1) {
        const [ user ] = result.rows;
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
  }
});
