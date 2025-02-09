({
  method: async ({ ...records }) => {
    try {
      await db.processTransaction(
        domain.item.update,
        records,
        true
      );
      return responseType.updated();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
