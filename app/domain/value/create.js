async (pool, clientId, inputData) => {
  const valueCreated = await crud('ItemValue').create([{ ...inputData }], pool);
  const [valueCreatedObj] = valueCreated.rows;
  const { itemId, value, createdAt } = valueCreatedObj;
  const itemRow = await crud('Item').select({ id: itemId, transaction: pool });
  const [item] = itemRow.rows;

  const detail = {
    itemId,
    latestAt: createdAt,
  };

  let create = false;
  const detailsByItem = await crud('ValueDetail').select({
    where: { itemId: inputData.itemId },
    transaction: pool
  });

  if (detailsByItem.rows && detailsByItem.rows.length > 0) {
    const existingRec =
      item.valueType === 'text' ?
        detailsByItem.rows.find((row) => row.title === value) ||
          (create = true) :
        detailsByItem.rows[0];
    await crud('ValueDetail').update(existingRec.id, detail, pool);
  } else create = true;

  if (create) {
    const calculatedDetails =
      await domain.item.calculateDetails(clientId, itemId);

    if (item.valueType !== 'text') {
      const details = { ...detail, ...calculatedDetails };
      await crud('ValueDetail').create([details], pool);
    } else {
      await Promise.all(
        calculatedDetails.map(async (d) => {
          const details = { itemId, ...d };
          const detailsByTitle = await crud('ValueDetail').select({
            where: { title: d.title },
            transaction: pool
          });
          if (detailsByTitle.rows && detailsByTitle.rows.length > 0)
            await crud('ValueDetail').update(detailsByTitle.id, details, pool);
          await crud('ValueDetail').create([details], pool);
        })
      );
    }
    // TODO: Add new value as well
  }

  return valueCreatedObj.id;
};
