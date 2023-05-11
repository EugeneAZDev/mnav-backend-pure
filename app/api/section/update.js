({
  // eslint-disable-next-line no-unused-vars
  method: async ({ id, clientId, ...records }) => {
    try {
      const { ...data } = records;
      await db('ItemSection').update(id, { ...data });
      return httpResponses.updated();
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
