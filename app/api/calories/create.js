({
  method: async ({ ...records }) => {
    try {
      const { clientId, ...args } = records;
      const createdAt = await domain.getLocalTime(clientId);
      const result = await crud('Calories').create([{
        userId: clientId,
        createdAt,
        ...args,
      }]);
      const [kcalItem] = result.rows;
      return responseType.modifiedBodyTemplate(responseType.created, {
        kcalId: kcalItem.id
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
