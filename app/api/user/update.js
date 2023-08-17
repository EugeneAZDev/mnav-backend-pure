({
  // eslint-disable-next-line no-unused-vars
  method: async ({ id, clientId, ...records }) => {
    try {
      await crud('User').update({ id, fields: records });
      return responseType.updated();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
