({
  method: async ({ id }) => {
    try {
      const result = await crud('Item').find('sectionId', [ id ]);
      if (result.rows.length > 0) {
        return {
          ...responseType.error(),
          body: 'Unable to delete: being used by Items',
        };
      }
      await crud('ItemSection').delete([id]);
      return responseType.deleted();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
