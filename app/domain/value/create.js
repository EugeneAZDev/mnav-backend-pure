async (pool, inputData) => {
  const valueCreated = await crud('ItemValue').create([{ ...inputData }], pool);
  const [valueObj] = valueCreated.rows;
  const { itemId, value, createdAt } = valueObj

  const itemRow = await crud('Item').read(itemId, undefined, pool);
  const [item] = itemRow.rows;

  const detail = {
    itemId: itemId,
    latestValueAt: createdAt
  }
  if (item.valueType === 'text') detail['titleValue'] = value

  let create = false
  const detailsByItem = await crud('ValueDetail').find('itemId', [inputData.itemId], undefined, pool);
  if (detailsByItem.rows && detailsByItem.rows.length > 0) {
    const existingRec = item.valueType === 'text'
      ? detailsByItem.rows.find(row => row.titleValue === value) || (create = true)
      : detailsByItem.rows[0]
    await crud('ValueDetail').update(existingRec.id, detail, pool);
  } else create = true

  if (create) await crud('ValueDetail').create([detail], pool)

  return valueObj.id;
}
