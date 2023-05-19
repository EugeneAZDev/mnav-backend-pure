({
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, ...records }) => {
    try {
      const { id, ...data } = records;
      await db('ItemValue').update(id, { ...data });
      return httpResponses.updated();
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
