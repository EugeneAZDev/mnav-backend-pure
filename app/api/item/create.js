({
  method: async ({ ...records }) => {
    try {
      const { clientId, target, ...args } = records;
      const createdAt = await domain.getLocalTime(clientId);
      const validTarget = common.validNumberValue(target);
      const result = await crud('Item').create([
        {
          userId: clientId,
          target: validTarget || null,
          createdAt,
          ...args,
        },
      ]);
      const [item] = result.rows;
      await domain.sync.updateSyncToFalse(undefined, clientId);
      return responseType.modifiedBodyTemplate(responseType.created, {
        itemId: item.id,
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
