async (pool, clientId, records) => {
  await domain.sync.updateSyncToFalse(pool, clientId);
  
  const { id, ...data } = records;
  const updatedAt = await domain.getLocalTime(clientId);

  const valueInfo = await crud('ItemValue').select({ id, transaction: pool });
  if (valueInfo && valueInfo.rows.length > 0) {
    const { itemId, value: previousValue } = valueInfo.rows[0];
    const itemInfo = await crud('Item').select({
      id: itemId,
      transaction: pool,
    });
    if (itemInfo && itemInfo.rows[0].valueType === 'text') {
      const detailRecordResult = await crud('ValueDetail').select({
        where: { title: previousValue },
        transaction: pool,
      });
      if (detailRecordResult && detailRecordResult.rows.length > 0) {
        const { id: detailsId } = detailRecordResult.rows[0];
        await crud('ValueDetail').update({
          id: parseInt(detailsId),
          fields: { deletedAt: updatedAt },
          transaction: pool,
        });
      }
    }
  };

  await crud('ItemValue').update({
    id,
    fields: { updatedAt, ...data },
    transaction: pool,
  });
};
