async (clientId, itemId) => {
  const commonCalculation = (values, nowLocal) => {
    const sortedValues = [...values];
    sortedValues.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const startedAt = sortedValues[0].createdAt;
    const latestAt = sortedValues[sortedValues.length - 1].createdAt;
    const totalDays =
      common.getDaysByDates(new Date(startedAt), new Date(latestAt)) + 1;
    const calculated = sortedValues.reduce(
      (acc, item) => {
        const current = item.value;
        if (current > acc.max) acc.max = current;
        if (current !== null) acc.daysDone++;

        return acc;
      },
      {
        daysDone: 0,
        daysMissed: 0,
        total: 0,
      },
    );

    calculated.daysMissed = totalDays - calculated.daysDone;

    for (const key in calculated)
      if (calculated[key] === 0) delete calculated[key];

    const details = {
      latestAt,
      startedAt,
      ...calculated,
    };

    return details;
  };

  const { body } = await api.value.getByItem().method({ clientId, itemId });
  const values = body && body.values;
  const valueType = body && body.valueType;

  const nowLocal = await domain.getLocalTime(clientId);
  if (valueType !== 'text') {
    return commonCalculation(values, nowLocal);
  } else {
    // TODO: Implement logic for text values
    // const valueTitleList =
    //  common.splitObjectIntoArraysByField(values, 'value');
    // const detailsList = [];
    // for (const title in valueTitleList) {
    //   const sortedValues = [...valueTitleList[title]];
    //   sortedValues.sort((a, b) =>
    //     new Date(a.createdAt) - new Date(b.createdAt));
    //   const startedAt = sortedValues[0].createdAt;
    //   const latestAt = sortedValues[sortedValues.length - 1].createdAt;
    //   const details = { latestAt, startedAt, title };
    //   detailsList.push(details);
    // }
    // return detailsList;
  }
};
