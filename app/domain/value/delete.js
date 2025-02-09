async (pool, clientId, id) => {
  await domain.sync.updateSyncToFalse(pool, clientId);
  await domain.user.updateDetails(pool, clientId);
  const valueInfo = await crud('ItemValue').select({ id, transaction: pool });
  const deletedAt = await domain.getLocalTime(clientId);
  await crud('ItemValue').update({
    id,
    fields: { deletedAt, updatedAt: deletedAt },
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
        if (detailRecordResult.rows?.length > 0) {
          const { id: detailsId } =  detailRecordResult.rows[0];
          await crud('ValueDetail').update({
            id: parseInt(detailsId),
            fields: { deletedAt },
            transaction: pool,
          });
        }
      }
    } else {
      const queryResult = await crud('ItemValue').select({
        fields: ['value', 'createdAt', 'updatedAt'],
        where: { itemId: [itemId] },
        orderBy: {
          fields: ['createdAt'],
          order: 'DESC',
        },
        limit: 1,
        transaction: pool,
      });

      if (queryResult && queryResult.rows.length > 0) {
        const { createdAt, updatedAt } = queryResult.rows[0];
        const date = updatedAt || createdAt;
        await crud('ValueDetail').update({
          fields: { latestAt: date },
          where: { itemId },
          transaction: pool,
        });
      }
    }
  }
};
