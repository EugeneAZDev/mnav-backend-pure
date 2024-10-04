({
  method: async ({ clientId }) => {
    try {
      const destroyedCountResult = await db.processTransaction(
        domain.user.destroy,
        clientId,
      );
      return responseType.modifiedBodyTemplate(responseType.deleted, {
        counts: destroyedCountResult,
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
