async (storeMonths) => {
  const startKeepTime = new Date();
  startKeepTime.setMonth(startKeepTime.getMonth() - storeMonths);
  const startKeepDate = startKeepTime.toISOString().split('T')[0];

  const sql = `
    DELETE FROM "ValueDetail" vd WHERE vd."deletedAt" < '${startKeepDate}';
    DELETE FROM "ItemValue" iv WHERE iv."deletedAt" < '${startKeepDate}';
    DELETE FROM "Item" i WHERE i."deletedAt" < '${startKeepDate}';
    DELETE FROM "ItemSection" s WHERE s."deletedAt" < '${startKeepDate}';
  `;
  const [
    { rowCount: removedDetails },
    { rowCount: removedValues },
    { rowCount: removedItems },
    { rowCount: removedSections },
  ] = await crud().query(sql);

  console.log(
    `CRON RUNNED ${
      new Date().toISOString().split('T')[0]
    }, Removal count: { Details: ${removedDetails}, Values: ${removedValues}, Items: ${removedItems}, Sections: ${removedSections}, KeepMonths: ${storeMonths} }`,
  );
};
