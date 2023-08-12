async (clientId) => {
  let tz = common.userTimeZoneMap.get(clientId);
  if (!tz) {
    tz = await crud('User').select({ id: clientId, fields: 'timeZone' }).rows[0]
      .timeZone;
    console.log(tz);
    if (!tz) throw Error('Unable to identify user locale');
    common.userTimeZoneMap.set(clientId, tz);
  }

  const adjustedTimestamp =
    new Date(new Date().getTime() + tz * 60 * 60 * 1000);

  return adjustedTimestamp;
};
