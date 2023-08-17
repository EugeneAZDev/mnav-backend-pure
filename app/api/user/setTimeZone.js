({
  method: async ({ clientId, timeZone }) => {
    try {
      console.log(`DEBUG INFO: ClientId: ${clientId}, timeZone: ${timeZone}`);
      await crud('User').update({ id: clientId, fields: { timeZone } });
      common.userTimeZoneMap.set(clientId, timeZone);
      return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
