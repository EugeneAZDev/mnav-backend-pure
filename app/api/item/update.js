({
  method: async ({ ...records }) => {
    try {
      const { clientId, id, target, ...data } = records;
      const validTarget = common.validItemTargetValue(target);
      await db('Item').update(id, {
        userId: clientId,
        target: validTarget,
        ...data,
      });
      return httpResponses.updated();
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
