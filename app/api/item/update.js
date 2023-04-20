({
  method: async ({ ...records }) => {
    try {
      const { id, ...data } = records;
      await db('Item').update(id, { ...data });
      return httpResponses.updated();
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
