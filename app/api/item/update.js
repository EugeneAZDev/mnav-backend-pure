({
  method: async ({ ...records }) => {
    try {
      await db.processTransaction(
        domain.item.update,
        records
      );
      return responseType.updated();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
