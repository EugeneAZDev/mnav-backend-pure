({
  method: async ({ ...records }) => {
    try {
      const { clientId, ...args } = records;
      const result = await db('ItemSection').create({
        userId: clientId,
        ...args,
      });
      const [section] = result.rows;
      return httpResponses.modifiedBodyTemplate(httpResponses.created, {
        sectionId: section.id
      });
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
