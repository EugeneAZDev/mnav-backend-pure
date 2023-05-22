({
  method: async ({ id }) => {
    try {
      const result = await db('Item').find('sectionId', [ id ]);
      if (result.rows.length > 0) {
        return {
          ...httpResponses.error(),
          body: 'Unable to delete: being used by Items',
        };
      }
      await db('ItemSection').delete(id);
      return httpResponses.deleted();
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
