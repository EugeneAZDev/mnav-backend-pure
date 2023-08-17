({
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, ...records }) => {
    try {
      const { id, ...data } = records;
      const updatedAt = await domain.getLocalTime(clientId);
      await crud('ItemValue').update({ id, fields: { updatedAt, ...data } });
      return responseType.updated();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
