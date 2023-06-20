({
  method: async ({ ...records }) => {
    try {
      const { clientId, ...args } = records;
      const result = await crud('ItemSection').create([{
        userId: clientId,
        ...args,
      }]);
      const [section] = result.rows;
      return responseType.modifiedBodyTemplate(responseType.created, {
        sectionId: section.id
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
