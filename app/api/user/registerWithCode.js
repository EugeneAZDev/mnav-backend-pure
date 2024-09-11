({
  access: 'public',
  method: async ({ clientId, id, email }) => {
    try {
      const userId = clientId || id && parseInt(id);
      const boolResult = await db.processTransaction(
        domain.user.registerWithCode,
        userId,
        email,
      );
      if (boolResult)
        return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
