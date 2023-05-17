({
  method: async ({ id }) => {
    try {
      const result = await db('Item').read(id);
      if (result.rows.length === 1) {
        const [ item ] = result.rows;
        return { ...httpResponses.success(), body: item };
      }
      return { ...httpResponses.success(), body: { item: undefined } };
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  }
});
