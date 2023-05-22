({
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, ...records }) => {
    try {
      const result = await db('ItemValue').create({ ...records });
      const [ value ] = result.rows;
      return httpResponses.modifiedBodyTemplate(httpResponses.created, {
        valueId: value.id
      });
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
