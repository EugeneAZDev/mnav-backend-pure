({
  access: 'public',
  method: async ({ email }) => {
    try {
      const boolResult = await db.processTransaction(
        domain.user.resetSync,
        email
      );
      if (boolResult)
        return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
