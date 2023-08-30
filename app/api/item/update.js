({
  method: async ({ ...records }) => {
    try {
      const { clientId, id, target, ...data } = records;
      const updatedAt = await domain.getLocalTime(clientId);
      const validTarget = target ? common.validNumberValue(target) : undefined;
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
