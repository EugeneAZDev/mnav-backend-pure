({
  method: async ({ clientId }) => {
    try {
      const result = await db('Item').find('userId', [clientId]);
      if (result.rows.length > 0) {
        const items = result.rows;
        return { ...httpResponses.success(), body: items };
      }
      return { ...httpResponses.success(), body: { items: [] } };
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  }
});
