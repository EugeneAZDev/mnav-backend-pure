async (pool, clientId, records) => {
  const valueDetails = await crud('ValueDetail').select({
    where: { itemId: records.itemId },
    transaction: pool,
  });

  const inputDate = records.createdAt && new Date(records.createdAt);
  const localDate = await domain.getLocalTime(clientId, inputDate);
  const createdAt = localDate || (await domain.getLocalTime(clientId));
  const result = await crud('ItemValue').create(
    [{ ...records, createdAt }],
    pool,
  );
  const [value] = result.rows;
  const { itemId } = value;
  const details = { itemId, latestAt: createdAt };
  if (valueDetails.rows.length) {
    const existingRec = valueDetails.rows[0];
    await crud('ValueDetail').update({
      id: existingRec.id,
      fields: details,
      transaction: pool,
    });
  } else await crud('ValueDetail').create([details], pool);

  return value.id;
};
