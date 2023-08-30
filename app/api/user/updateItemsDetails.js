({
  method: async ({ clientId }) => {
    try {
      const updatedAt = await db.processTransaction(
        domain.user.updateDetails,
        clientId,
      );
      return responseType.modifiedBodyTemplate(responseType.success, {
        updatedAt,
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
