({
  method: async ({ clientId }) => {
    try {
      const result = await db('ItemSection').find('userId', [clientId]);
      if (result.rows.length > 0) {
        const sections = result.rows;
        return httpResponses.modifiedBodyTemplate(httpResponses.success, {
          sections
        });
      }
      return httpResponses.modifiedBodyTemplate(httpResponses.success, {
        sections: []
      });
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
