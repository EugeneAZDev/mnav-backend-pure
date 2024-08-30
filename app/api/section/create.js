({
  method: async ({ ...records }) => {
    try {
      const { clientId, ...args } = records;
      const createdAt = await domain.getLocalTime(clientId);
      const result = await crud('ItemSection').create([{
        userId: clientId,
        createdAt,
        updatedAt: createdAt,
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
