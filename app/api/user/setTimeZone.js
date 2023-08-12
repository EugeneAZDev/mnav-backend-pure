({
  method: async ({ clientId, timeZone }) => {
    try {
      await crud('User').update(clientId, { timeZone });
      common.userTimeZoneMap.set(clientId, timeZone);
      return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
