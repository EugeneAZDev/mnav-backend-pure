async (pool, clientId, id) => {
  const apiResult =
    await api.value.getByItem().method({ clientId, itemId: id });
  const values = apiResult?.body?.values;
  const valueCount = values?.length;
  if (valueCount === 0) {
    return;
  } else {
    await domain.sync.updateSyncToFalse(pool, clientId);
    await domain.user.updateDetails(pool, clientId);
    const deletedAt = await domain.getLocalTime(clientId);
    const idsToDelete = values.map((v) => v.id);
    const sql =
      `DELETE FROM "ItemValue"
          WHERE id IN (${idsToDelete.map((_, i) => `$${i + 1}`).join(',')})`;
    await crud().query(sql, [...idsToDelete], pool);
    await crud('ValueDetail').update({
      fields: { deletedAt },
      where: { itemId: id },
      transaction: pool,
    });
  }
};
