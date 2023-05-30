({
  method: async ({ ...records }) => {
    try {
      const { clientId, id, target, ...data } = records;
      const validTarget = common.validNumberValue(target);
      await db('Item').update(id, {
        userId: clientId,
        target: validTarget,
        ...data,
      });
      return responseType.updated();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
