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
    let maxRecordCountObj = undefined;
    let maxRecordTotalObj = undefined;

    const [ item ] = itemResultDB.rows;
    const detailsResultDB = await crud('ValueDetail').select({
      where: { itemId: item.id }
    });
    const [ details ] =
      detailsResultDB?.rows.length > 0 && detailsResultDB.rows || [];

    const sqlForCountOfView =
      'UPDATE "View" SET views = views + 1 WHERE id = $1 RETURNING views;';
    const viewsQuery =
      await crud().query(sqlForCountOfView, [publicStatisticsId], pool);
    let views = undefined;
    let totalRecordsCount = undefined;
    if (viewsQuery?.rows?.length > 0) {
      views = viewsQuery.rows[0].views;
    }

    const sqlForCountRecords = `
      SELECT
        to_char(iv."createdAt", 'YYYY-MM-DD') AS date,
        SUM(CAST(value AS NUMERIC)) AS total,
        COUNT(*) AS count
      FROM "ItemValue" iv
        WHERE iv."itemId" = ${item.id} AND iv."deletedAt" IS NULL
      GROUP BY iv."createdAt"
      ORDER BY date DESC;
    `;

    const valueRecordsCountQuery =
      await crud().query(sqlForCountRecords, [], pool);
    if (valueRecordsCountQuery?.rows?.length > 0) {
      const recordsResult = valueRecordsCountQuery.rows;

      totalRecordsCount =
        recordsResult.reduce((sum, item) => sum + Number(item.count), 0);

      maxRecordCountObj = recordsResult[0];
      for (const item of recordsResult) {
        if (Number(item.count) > Number(maxRecordCountObj.count)) {
          maxRecordCountObj = item;
        }
      }

      maxRecordTotalObj = recordsResult[0];
      for (const item of recordsResult) {
        if (Number(item.total) > Number(maxRecordTotalObj.total)) {
          maxRecordTotalObj = item;
        }
      }
    }

    return {
      item,
      details,
      totalRecordsCount,
      views,
      maxRecordTotalObj,
      maxRecordCountObj,
    };
  } else {
    return null;
  }
};
