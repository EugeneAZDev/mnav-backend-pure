({
  method: async ({ clientId }) => {
    try {
      const result = await db('ItemSection').find('userId', [ clientId ]);
      if (result.rows.length > 0) {
        const sections = result.rows;
        return { ...httpResponses.success(), body: { sections } };
      }
      return { ...httpResponses.success(), body: { sections: [] } };
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  }
});
