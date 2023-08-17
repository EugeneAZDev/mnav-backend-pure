({
  method: async ({ ...records }) => {
    try {
      const { clientId, id, target, ...data } = records;
      const updatedAt = await domain.getLocalTime(clientId);
      const validTarget = common.validNumberValue(target);
      await crud('Item').update({
        id,
        fields: {
          userId: clientId,
          target: validTarget,
          updatedAt,
          ...data,
        },
      });
      return responseType.updated();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
