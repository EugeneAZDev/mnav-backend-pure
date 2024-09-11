({
  access: 'public',
  method: async ({ clientId, email }) => {
    try {
      const boolResult = await db.processTransaction(
        domain.user.resetSync,
        clientId,
        email,        
      );
      if (boolResult)
        return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
