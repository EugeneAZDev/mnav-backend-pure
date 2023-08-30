async (pool, clientId) => {
  const initial = {
    dateDaysLatestStrike: null,
    dateDaysLatestTargetDelay: null,
    dateDaysLatestTargetStrike: null,
    dateDaysMaxDelay: null,
    dateDaysMaxStrike: null,
    dateDaysMaxTargetDelay: null,
    dateDaysMaxTargetStrike: null,
    dateDaysMinDelay: null,
    dateDaysMinStrike: null,
    dateDaysMinTargetDelay: null,
    dateDaysMinTargetStrike: null,
    daysDone: 0,
    daysLatestDelay: 0,
    daysLatestStrike: 0,
    daysLatestTargetDelay: 0,
    daysLatestTargetStrike: 0,
    daysMaxDelay: 0,
    daysMaxStrike: 0,
    daysMaxTargetDelay: 0,
    daysMaxTargetStrike: 0,
    daysMinDelay: 0,
    daysMinStrike: 0,
    daysMinTargetDelay: 0,
    daysMinTargetStrike: 0,
    daysMissed: 0,
    daysTargetDone: 0,
    daysTargetMissed: 0,
    max: 0,
    maxPerDay: 0,
    min: 0,
    minPerDay: 0,
    startedAt: null,
    total: 0,
    latestAt: null,
    dateMax: null,
    dateMaxPerDay: null,
    dateMin: null,
    dateMinPerDay: null,
  };

  const result = await crud('Item').select({
    where: { userId: clientId },
    transaction: pool,
  });
  if (result.rows.length > 0) {
    const items = result.rows;
    const rawValues = await crud('ItemValue').select({
      where: { itemId: [...items.map((r) => r.id)] },
      transaction: pool,
    });
    const itemsValuesSet = items.reduce((acc, item) => {
      const values = rawValues.rows.filter((value) => value.itemId === item.id);
      acc.push({
        ...item,
        values,
      });
      return acc;
    }, []);

    for await (const iv of itemsValuesSet) {
      if (iv.values.length > 0) {
        const target =
          iv.target === null || iv.target <= 0 ?
            (iv.target = undefined) :
            iv.target;

        const calculatedDetails = await domain.item.calculateDetails(
          clientId,
          iv.values,
          target,
          iv.valueType,
        );

        if (iv.valueType !== 'text') {
          const detailsByItem = await crud('ValueDetail').select({
            where: { itemId: iv.id },
            transaction: pool,
          });

          if (detailsByItem.rows.length === 0) {
            await crud('ValueDetail').create(
              [{ ...initial, ...calculatedDetails, itemId: iv.id }],
              pool,
            );
          } else {
            let neededUpdate = false;
            const [existingRec] = detailsByItem.rows;

            for (const field in existingRec) {
              let calculatedValue = calculatedDetails[field];
              let existingValue = existingRec[field];

              if (
                ['id', 'createdAt', 'updatedAt', 'deletedAt', 'itemId'].some(
                  (r) => field === r,
                ) ||
                !calculatedValue
              )
                continue;

              if (
                field.includes('date') ||
                ['latestAt', 'startedAt'].some((r) => field === r)
              ) {
                calculatedValue = new Date(calculatedValue)
                  .toISOString()
                  .split('T')[0];
                existingValue = new Date(existingValue)
                  .toISOString()
                  .split('T')[0];
              }

              if (calculatedValue !== existingValue) {
                neededUpdate = true;
                break;
              }
            }

            if (neededUpdate) {
              await crud('ValueDetail').update({
                id: existingRec.id,
                fields: {
                  ...initial,
                  updatedAt: new Date(),
                  ...calculatedDetails,
                },
                transaction: pool,
              });
            }
          }
        } else {
          for await (const subitem of calculatedDetails) {
            const [title, calculatedDetails] = subitem;

            const detailsBySubItem = await crud('ValueDetail').select({
              where: { itemId: iv.id, title },
              transaction: pool,
            });

            if (detailsBySubItem.rows.length === 0) {
              await crud('ValueDetail').create(
                [{ ...initial, ...calculatedDetails, itemId: iv.id, title }],
                pool,
              );
            } else {
              let neededUpdate = false;
              const [existingRec] = detailsBySubItem.rows;

              for (const field in existingRec) {
                let calculatedValue = calculatedDetails[field];
                let existingValue = existingRec[field];

                if (
                  ['id', 'createdAt', 'updatedAt', 'deletedAt', 'itemId'].some(
                    (r) => field === r,
                  ) ||
                  !calculatedValue
                )
                  continue;

                if (
                  field.includes('date') ||
                  ['latestAt', 'startedAt'].some((r) => field === r)
                ) {
                  calculatedValue = new Date(calculatedValue)
                    .toISOString()
                    .split('T')[0];
                  existingValue = new Date(existingValue)
                    .toISOString()
                    .split('T')[0];
                }

                if (calculatedValue !== existingValue) {
                  neededUpdate = true;
                  break;
                }
              }
              if (neededUpdate) {
                await crud('ValueDetail').update({
                  id: existingRec.id,
                  fields: {
                    ...initial,
                    updatedAt: new Date(),
                    ...calculatedDetails,
                  },
                  transaction: pool,
                });
              }
            }
          }
        }
      }
    }
  }
  const updatedDetailsAt = await domain.getLocalTime(clientId);
  await crud('User').update({
    id: clientId,
    fields: { updatedAt: new Date(), updatedDetailsAt },
    transaction: pool,
  });
  return updatedDetailsAt;
};
