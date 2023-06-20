({
  // eslint-disable-next-line no-unused-vars
  method: async ({ id, clientId, ...records }) => {
    try {
      const { ...data } = records;
      await crud('ItemSection').update(id, { ...data });
      return responseType.updated();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
