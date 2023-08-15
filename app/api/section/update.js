({
  // eslint-disable-next-line no-unused-vars
  method: async ({ id, clientId, ...records }) => {
    try {
      const updatedAt = await domain.getLocalTime(clientId);
      await crud('ItemSection').update({
        id,
        fields: { updatedAt, ...records },
      });
      return responseType.updated();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
