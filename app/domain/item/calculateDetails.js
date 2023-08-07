async (clientId, itemId) => {
  try {
    const { body } = await api.value.getByItem().method({ clientId, itemId });
    const values = body && body.values;
    const valueType = body && body.valueType

    if (valueType !== 'text') {
      const sortedValues = [...values]
      sortedValues.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

      const startedAt = sortedValues[0]
      const latestAt = sortedValues[sortedValues.length - 1]

      const calculated = sortedValues.reduce((acc, item, index) => {
        const createdAt = new Date(item.createdAt);
        const currentValue = item.value;

        if (currentValue !== null) acc.total++;
        if (currentValue > acc.max) acc.max = currentValue;

        if (currentValue !== null) acc.daysDone++;
          else acc.daysMissed++;

        return acc;
      },
        {
          daysDone: 0,
          daysMissed: 0,
          total: 0,
        }
      );

      const details = {
        latestAt,
        startedAt,
        ...calculated
      }
      console.log(details);
    } else {
      const valueTitleList = common.splitObjectIntoArraysByField(values, 'value')
    }



  } catch (error) {
    throw error;
  }
}