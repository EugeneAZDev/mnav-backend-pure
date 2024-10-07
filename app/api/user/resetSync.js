({
  access: 'public',
  method: async ({ clientId, email, fullReset = false }) => {
    try {
      const boolResult = await db.processTransaction(
        domain.user.resetSync,
        clientId,
        email,
        fullReset,  
      );
      if (boolResult)
        return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
