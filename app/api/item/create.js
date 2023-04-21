({
  method: async ({ ...records }) => {
    try {
      const result = await db('Item').create({ ...records });
      const [ item ] = result.rows;
      return {
        ...httpResponses.created(),
        body: {
          ...httpResponses.created().body,
          itemId: item.id,
        },
      };
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});