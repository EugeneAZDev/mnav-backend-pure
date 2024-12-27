({
  // eslint-disable-next-line no-unused-vars
  method: async ({ id, clientId, ...records }) => {
    try {
      await crud('Settings').update({ id: id || clientId, fields: records });
      return responseType.updated();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
