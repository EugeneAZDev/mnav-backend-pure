async (pool, clientId) => {
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
        const calculatedDetails = await domain.item.calculateDetails(
          clientId,
          iv.values,
          iv.target,
          iv.valueType,
        );

        if (iv.valueType !== 'text') {
          const detailsByItem = await crud('ValueDetail').select({
            where: { itemId: iv.id },
            transaction: pool,
          });

          if (detailsByItem.rows.length === 0) {
            await crud('ValueDetail').create(
              [{ ...calculatedDetails, itemId: iv.id }],
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
                fields: { updatedAt: new Date(), ...calculatedDetails },
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
                [{ ...calculatedDetails, itemId: iv.id, title }],
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
                  fields: { updatedAt: new Date(), ...calculatedDetails },
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
};
