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
    const itemInfo = await crud('Item').select({
      id: itemId,
      transaction: pool,
    });
    if (itemInfo.rows[0].valueType === 'text') {
      const sameValueTitlesCount = await crud('ItemValue').select({
        count: 'id',
        where: { itemId, value },
        transaction: pool,
      });
      if (parseInt(sameValueTitlesCount) === 0) {
        const detailRecordResult = await crud('ValueDetail').select({
          where: { itemId, title: value },
          transaction: pool,
        });
        const { id: detailsId } = detailRecordResult.rows[0];
        await crud('ValueDetail').update({
          id: parseInt(detailsId),
          fields: { deletedAt },
          transaction: pool,
        });
      }
    }
  }
};
