({
  method: async ({ clientId, id }) => {
    try {
      const deletedAt = await domain.getLocalTime(clientId);
      await crud('ItemValue').update({
        id,
        fields: { deletedAt }
      });
      return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  }
});
