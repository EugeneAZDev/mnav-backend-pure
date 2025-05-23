async (clientId, time) => {
  let tz = common.userTimeZoneMap.get(clientId);
  if (!tz) {
    tz = (
      await crud('User').select({
        id: clientId,
        fields: ['timeZone'],
      })
    ).rows[0].timeZone;
    if (!tz) throw Error('Unable to identify user locale due to No Time Zone!');
    common.userTimeZoneMap.set(clientId, tz);
  }

  const date = (time && new Date(time)) || new Date();
  const offset = date.getTimezoneOffset();
  const originHours = date.getUTCHours();
  const originMinutes = date.getMinutes();
  const summerTZ = new Date(date.getFullYear(), 7, 1).getTimezoneOffset();

  let adjustedTimestamp = new Date(date.getTime() + tz * 60 * 60 * 1000);
  if (offset === summerTZ && originHours === 21 && originMinutes === 0) {
    adjustedTimestamp =
      new Date(adjustedTimestamp.getTime() + (1 * 60 * 60 * 1000));
  }

  return adjustedTimestamp;
};
