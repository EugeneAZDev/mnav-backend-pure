({
  access: 'public',
  method: async ({ id, password }) => {
    try {
      const hash = await common.hashPassword(password);
      const result = await crud('User').read(id);
      if (result.rows.length === 1) {
        await crud('User').update(id, { password: hash, token: undefined });
        return responseType.success();
      }
      return responseType.notFound();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
