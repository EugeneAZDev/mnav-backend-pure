async (pool, clientId, id) => {
  const apiResult =
    await api.value.getByItem().method({ clientId, itemId: id });
  const values = apiResult?.body?.values;
  const valueCount = values?.length;
  if (valueCount === 0) { return; } else {
    await domain.sync.updateSyncToFalse(pool, clientId);
    await domain.user.updateDetails(pool, clientId);
    const deletedAt = await domain.getLocalTime(clientId);
    await Promise.all(
      values.map(async (v) => {
        await crud('ItemValue').update({
          id: v.id,
          fields: { deletedAt, updatedAt: deletedAt },
          transaction: pool,
        });
      })
    );
    await crud('ValueDetail').update({
      fields: { deletedAt },
      where: { itemId: id },
      transaction: pool,
    });
  }
};
