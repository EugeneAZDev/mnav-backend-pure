async (clientId, time) => {
  let tz = common.userTimeZoneMap.get(clientId);
  if (!tz) {
    tz = (
      await crud('User').select({
        id: clientId,
        fields: ['timeZone'],
      })
    ).rows[0].timeZone;
    if (!tz) throw Error('Unable to identify user locale');
    common.userTimeZoneMap.set(clientId, tz);
  }

  const date = (time && new Date(time)) || new Date();
  const adjustedTimestamp = new Date(date.getTime() + tz * 60 * 60 * 1000);

  return adjustedTimestamp;
};
