({
  method: async ({ ...records }) => {
    try {
      const { clientId, target, ...args } = records;
      const validTarget = common.validItemTargetValue(target);
      const result = await db('Item').create({
        userId: clientId,
        target: validTarget,
        ...args,
      });
      const [item] = result.rows;
      return {
        ...httpResponses.created(),
        body: { itemId: item.id },
      };
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
