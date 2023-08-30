({
  // eslint-disable-next-line no-unused-vars
  method: async ({ id, clientId, ...records }) => {
    try {
      common.userSettingsMap.delete(clientId);
      await crud('User').update({ id: id || clientId, fields: records });
      return responseType.updated();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
