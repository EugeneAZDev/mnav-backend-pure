({
  method: async ({ ...records }) => {
    try {
      const result = await db('ItemValue').create({ ...records });
      const [ value ] = result.rows;
      return {
        ...httpResponses.created(),
        body: {
          ...httpResponses.created().body,
          valueId: value.id,
        },
      };
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});