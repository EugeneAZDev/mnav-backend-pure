async (storeMonths) => {
  const startKeepTime = new Date();
  startKeepTime.setMonth(startKeepTime.getMonth() - storeMonths);
  const startKeepDate = startKeepTime.toISOString().split('T')[0];
  // Excluded from the sql;
  // DELETE FROM "Item" i WHERE i."deletedAt" < '${startKeepDate}';
  const sql = `
    DELETE FROM "ValueDetail" vd WHERE vd."deletedAt" < '${startKeepDate}';
    DELETE FROM "ItemValue" iv WHERE iv."deletedAt" < '${startKeepDate}';
    DELETE FROM "ItemSection" s WHERE s."deletedAt" < '${startKeepDate}';
  `;
  const [
    { rowCount: removedDetails },
    { rowCount: removedValues },
    // { rowCount: removedItems },
    { rowCount: removedSections },
  ] = await crud().query(sql);
  console.log(
    `CRON RUNNED ${
      new Date().toISOString().split('T')[0]
      // eslint-disable-next-line max-len
    }, Removal count: { Details: ${removedDetails}, Values: ${removedValues}, Sections: ${removedSections}, KeepMonths: ${storeMonths} }`,
  );
};
