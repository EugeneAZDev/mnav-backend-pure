async (pool, clientId, id) => {
  const valueInfo = await crud('ItemValue').select({ id, transaction: pool });

  const deletedAt = await domain.getLocalTime(clientId);
  await crud('ItemValue').update({
    id,
    fields: { deletedAt },
    transaction: pool,
  });

  if (valueInfo.rows.length > 0) {
    const { itemId, value } = valueInfo.rows[0];
    const sameValueTitlesCount = await crud('ItemValue').select({
      count: 'id',
      where: { itemId, value },
      transaction: pool,
    });
    if (parseInt(sameValueTitlesCount) === 0) {
      console.log(itemId, value);
      const detailRecordResult = await crud('ValueDetail').select({
        where: { itemId, title: value },
        transaction: pool,
      });
      console.log(detailRecordResult.rows[0]);
      const { id: detailsId } = detailRecordResult.rows[0];
      console.log(detailsId);
      await crud('ValueDetail').update({
        id: parseInt(detailsId),
        fields: { deletedAt },
        transaction: pool,
      });
    }
  }
};
