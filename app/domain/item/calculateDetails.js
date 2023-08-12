async (clientId, itemId) => {
  const { body } = await api.value.getByItem().method({ clientId, itemId });
  const values = body && body.values;
  const valueType = body && body.valueType;

  if (valueType !== 'text') {
    const sortedValues = [...values];
    sortedValues.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const startedAt = sortedValues[0].createdAt;
    const latestAt = sortedValues[sortedValues.length - 1].createdAt;
    const calculated = sortedValues.reduce(
      (acc, item) => {
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
      },
    );

    for (const key in calculated)
      if (calculated[key] === 0) delete calculated[key];

    const details = {
      latestAt,
      startedAt,
      ...calculated,
    };

    return details;
  } else {
    const valueTitleList = common.splitObjectIntoArraysByField(values, 'value');
    const detailsList = [];
    for (const title in valueTitleList) {
      const sortedValues = [...valueTitleList[title]];
      sortedValues.sort((a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt));
      const startedAt = sortedValues[0].createdAt;
      const latestAt = sortedValues[sortedValues.length - 1].createdAt;
      const details = { latestAt, startedAt, title };
      detailsList.push(details);
    }

    return detailsList;
  }
};
