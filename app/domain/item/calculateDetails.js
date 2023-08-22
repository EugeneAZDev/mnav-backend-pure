async (clientId, values, valueTarget, valueType) => {
  const boolValuesAllDays = {};
  const boolTargetReachedAllDays = {};

  const commonCalculation = (values, nowLocal, target) => {
    const sortedValues = [...values];
    sortedValues.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const startedAt = sortedValues[0].createdAt;
    const latestAt = sortedValues[sortedValues.length - 1].createdAt;
    const dateList = [];
    for (
      let d = new Date(startedAt);
      d <= new Date(nowLocal);
      d.setDate(d.getDate() + 1)
    ) {
      dateList.push(new Date(d));
    }
    const valuesByDate = common.splitObjectIntoArraysByField(
      common.transformToPureDate(sortedValues),
      'createdAt',
    );
    const valuesAllDays = { ...valuesByDate };
    dateList.forEach((date) => {
      const dateString = date.toISOString().split('T')[0];
      if (!valuesAllDays[dateString]) valuesAllDays[dateString] = [];
    });

    const commonDetails = {
      daysDone: 0,
      daysMissed: 0,
      max: 0,
      min: Infinity,
      total: 0,
      maxPerDay: 0,
      minPerDay: Infinity,
      dateMax: null,
      dateMaxPerDay: null,
      dateMin: null,
      dateMinPerDay: null,
    };
    if (target) {
      commonDetails['daysTargetMissed'] = 0;
      commonDetails['daysTargetDone'] = 0;
    }

    const sortedDatesOnly = Object.keys(valuesAllDays).sort();
    for (const date of sortedDatesOnly) {
      const objOfValue = valuesAllDays[date];
      const sum = objOfValue.reduce((acc, next) => {
        const num = parseInt(next.value);
        if (!isNaN(num)) {
          if (num >= commonDetails.max) {
            commonDetails.max = num;
            commonDetails.dateMax = date;
          }
          if (num <= commonDetails.min) {
            commonDetails.min = num;
            commonDetails.dateMin = date;
          }
          commonDetails.total += num;
        }
        return isNaN(num) ? acc : acc + num;
      }, 0);
      if (target) {
        const targetReached = sum >= target;
        if (targetReached) commonDetails.daysTargetDone++;
        else commonDetails.daysTargetMissed++;
        boolTargetReachedAllDays[date] = targetReached;
      }
      if (objOfValue.length > 0) {
        if (sum >= commonDetails.maxPerDay) {
          commonDetails.maxPerDay = sum;
          commonDetails.dateMaxPerDay = date;
        }
        if (sum <= commonDetails.minPerDay) {
          commonDetails.minPerDay = sum;
          commonDetails.dateMinPerDay = date;
        }
        commonDetails.daysDone++;
      } else {
        commonDetails.daysMissed++;
      }
      boolValuesAllDays[date] = objOfValue.length > 0;
    }

    return { startedAt, latestAt, ...commonDetails };
  };

  const nowLocal = await domain.getLocalTime(clientId);
  if (valueType !== 'text') {
    const commonDetails = commonCalculation(values, nowLocal, valueTarget);
    const strikeDelayInitial = {
      daysMaxDelay: 0,
      daysMaxStrike: 0,
      daysMinDelay: Infinity,
      daysMinStrike: Infinity,
      daysLatestDelay: 0,
      daysLatestStrike: 0,
      dateDaysMaxDelay: null,
      dateDaysMaxStrike: null,
      dateDaysMinDelay: null,
      dateDaysMinStrike: null,
      dateDaysLatestDelay: null,
      dateDaysLatestStrike: null,
    };
    const strikeDelayDetails = domain.getStrikeData(
      strikeDelayInitial,
      boolValuesAllDays,
      'Delay',
      'Strike',
    );
    const targetReachedInitial = {
      daysMaxTargetDelay: 0,
      daysMaxTargetStrike: 0,
      daysMinTargetDelay: Infinity,
      daysMinTargetStrike: Infinity,
      daysLatestTargetDelay: 0,
      daysLatestTargetStrike: 0,
      dateDaysMaxTargetDelay: null,
      dateDaysMaxTargetStrike: null,
      dateDaysMinTargetDelay: null,
      dateDaysMinTargetStrike: null,
      dateDaysLatestTargetDelay: null,
      dateDaysLatestTargetStrike: null,
    };
    const targetDetails =
      valueTarget &&
      !isNaN(valueTarget) &&
      domain.getStrikeData(
        targetReachedInitial,
        boolTargetReachedAllDays,
        'TargetDelay',
        'TargetStrike',
      );
    const calculatedDetails = {
      ...commonDetails,
      ...strikeDelayDetails,
      ...targetDetails,
    };
    return Object.fromEntries(
      Object.entries(calculatedDetails).filter(([_, value]) =>
        [null, Infinity, 0].every((v) => value !== v),
      ),
    );
  } else {
    const textValueDetailsMap = new Map();
    const valueTitleList = common.splitObjectIntoArraysByField(values, 'value');
    for (const title in valueTitleList) {
      const boolValuesAllDays = {};
      const sortedValues = [...valueTitleList[title]];
      sortedValues.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );
      const startedAt = sortedValues[0].createdAt;
      const latestAt = sortedValues[sortedValues.length - 1].createdAt;
      const dateList = [];
      for (
        let d = new Date(startedAt);
        d <= new Date(nowLocal);
        d.setDate(d.getDate() + 1)
      ) {
        dateList.push(new Date(d));
      }

      const commonDetails = {
        daysDone: 0,
        daysMissed: 0,
      };
      const valuesAllDays = [
        ...sortedValues.map((r) => r.createdAt.toISOString().split('T')[0]),
      ];
      dateList.forEach((date) => {
        const dateString = date.toISOString().split('T')[0];
        if (valuesAllDays.includes(dateString)) {
          commonDetails.daysDone++;
          boolValuesAllDays[dateString] = true;
        } else {
          commonDetails.daysMissed++;
          boolValuesAllDays[dateString] = false;
        }
      });

      const strikeDelayInitial = {
        daysMaxDelay: 0,
        daysMaxStrike: 0,
        daysMinDelay: Infinity,
        daysMinStrike: Infinity,
        daysLatestDelay: 0,
        daysLatestStrike: 0,
        dateDaysMaxDelay: null,
        dateDaysMaxStrike: null,
        dateDaysMinDelay: null,
        dateDaysMinStrike: null,
        dateDaysLatestDelay: null,
        dateDaysLatestStrike: null,
      };
      const strikeDelayDetails = domain.getStrikeData(
        strikeDelayInitial,
        boolValuesAllDays,
        'Delay',
        'Strike',
      );
      const calculatedDetails = {
        startedAt,
        latestAt,
        ...commonDetails,
        ...strikeDelayDetails,
      };

      const details = Object.fromEntries(
        Object.entries(calculatedDetails).filter(([_, value]) =>
          [null, Infinity, 0].every((v) => value !== v),
        ),
      );

      textValueDetailsMap.set(title, details);
    }
    return textValueDetailsMap;
  }
};
