({
  access: 'public',
  method: async ({ id, password }) => {
    try {
      const hash = await common.hashPassword(password);
      const result = await crud('User').select({ id });
      if (result && result.rows.length === 1) {
        await crud('User').update({
          id,
          fields: {
            password: hash,
            token: undefined,
            digitCode: undefined
          },
        });
        return responseType.success();
      }
      return responseType.notFound();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
