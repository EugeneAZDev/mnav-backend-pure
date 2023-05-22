({
  method: async ({ id }) => {
    try {
      const result = await db('Item').read(id);
      if (result.rows.length === 1) {
        const [item] = result.rows;
        return httpResponses.modifiedBodyTemplate(httpResponses.success, {
          item,
        });
      }
      return httpResponses.modifiedBodyTemplate(httpResponses.success, {
        item: undefined,
      });
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
