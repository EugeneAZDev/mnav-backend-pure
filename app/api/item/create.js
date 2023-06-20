({
  method: async ({ ...records }) => {
    try {
      const { clientId, target, ...args } = records;
      const validTarget = common.validNumberValue(target);
      const result = await crud('Item').create([{
        userId: clientId,
        target: validTarget || null,
        ...args,
      }]);
      const [item] = result.rows;
      return responseType.modifiedBodyTemplate(responseType.created, {
        itemId: item.id,
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
