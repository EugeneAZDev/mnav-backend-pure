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

  const originDate = new Date(time);  
  const summerTZ = new Date(originDate.getFullYear(), 7, 1).getTimezoneOffset();

  const offset = originDate.getTimezoneOffset();
  const originHours = originDate.getHours();
  const originMinutes = originDate.getMinutes();

  const date = (time && new Date(time)) || new Date();
  let adjustedTimestamp = new Date(date.getTime() + tz * 60 * 60 * 1000);  
  if (offset === summerTZ && originHours === 0 && originMinutes === 0) {
    adjustedTimestamp = new Date(adjustedTimestamp.getTime() + (1 * 60 * 60 * 1000));    
  }

  return adjustedTimestamp;
};
