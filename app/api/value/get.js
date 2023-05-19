({
  method: async ({ id }) => {
    try {
      const result = await db('ItemValue').read(id);
      if (result.rows.length === 1) {
        const [ value ] = result.rows;
        return { ...httpResponses.success(), body: value };
      }
      return { ...httpResponses.success(), body: { value: undefined } };
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  }
});
