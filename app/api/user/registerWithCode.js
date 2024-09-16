({
  access: 'public',
  method: async ({ id, email }) => {
    try {
      const boolResult = await db.processTransaction(
        domain.user.registerWithCode,
        id,
        email,
      );
      if (boolResult)
        return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
