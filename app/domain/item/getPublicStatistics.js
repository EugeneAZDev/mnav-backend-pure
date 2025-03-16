async (pool, records) => {
  const { id: publicStatisticsId } = records;
  const itemResultDB = await crud('Item').select({
    where: { publicStatisticsId },
    transaction: pool,
  });
  if (
    itemResultDB?.rows.length > 0 &&
    itemResultDB?.rows[0]?.publicStatisticsId
  ) {
    const [ item ] = itemResultDB.rows;
    const detailsResultDB = await crud('ValueDetail').select({
      where: { itemId: item.id }
    });
    const [ details ] =
      detailsResultDB?.rows.length > 0 && detailsResultDB.rows || [];
    return { item, details };
  } else {
    return null;
  }
};
