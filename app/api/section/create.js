({
  method: async ({ ...records }) => {
    try {
      const { clientId, ...args } = records;
      console.log('create item records');
      console.log(records);
      const result = await db('ItemSection').create({
        userId: clientId,
        ...args,
      });
      const [section] = result.rows;
      return {
        ...httpResponses.created(),
        body: {
          ...httpResponses.created().body,
          sectionId: section.id,
        },
      };
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
