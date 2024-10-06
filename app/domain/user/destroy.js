async (pool, clientId) => {  
  const sqlDestroyDetails = 
    `DELETE FROM "ValueDetail" vd USING "Item" i WHERE vd."itemId" = i.id AND i."userId" = ${clientId};`;
  const destroyDetailsResult = await crud().query(sqlDestroyDetails, undefined, pool);
  const sqlDestroyDeletedValues = `
    DELETE FROM "ItemValue" iv USING "Item" i
    WHERE
      iv."itemId" = i.id AND
      iv."deletedAt" IS NOT NULL AND
      i."userId" = ${clientId};`;
  await crud().query(sqlDestroyDeletedValues, undefined, pool);
  const sqlDestroyValues =
    `DELETE FROM "ItemValue" iv USING "Item" i WHERE iv."itemId" = i.id AND	i."userId" = ${clientId};`;
  const destroyValuesResult = await crud().query(sqlDestroyValues, undefined, pool);
  const sqlDestroyDeletedItems = `
    DELETE FROM "Item" i
      WHERE
        i."deletedAt" IS NOT NULL AND
        i."userId" = ${clientId};
  `;
  await crud().query(sqlDestroyDeletedItems, undefined, pool);
  const sqlDestroyItems = `DELETE FROM "Item" i WHERE i."userId" = ${clientId};`;
  const destroyItemsResult = await crud().query(sqlDestroyItems, undefined, pool);
  const sqlDestroyDeletedSections = `
    DELETE FROM "ItemSection" is2
    WHERE
      is2."deletedAt" IS NOT NULL AND
      is2."userId" = ${clientId}
  `;
  await crud().query(sqlDestroyDeletedSections, undefined, pool);
  const sqlDestroySections = `DELETE FROM "ItemSection" is2 WHERE is2."userId" = ${clientId}`;
  const destroySectionsResult = await crud().query(sqlDestroySections, undefined, pool);
  const sqlDestroyPayments = `DELETE FROM "Payment" p WHERE p."userId" = ${clientId}`;
  const destroyPaymentsResult = await crud().query(sqlDestroyPayments, undefined, pool);
  const sqlDestroyUser = `DELETE FROM "User" u WHERE u."id" = ${clientId}`;
  await crud().query(sqlDestroyUser, undefined, pool);
  console.log(`The user #${clientId} has been destroyed!`);
  return {
    details: destroyDetailsResult.rowCount,
    values: destroyValuesResult.rowCount,
    items: destroyItemsResult.rowCount,
    sections: destroySectionsResult.rowCount,
    payments: destroyPaymentsResult.rowCount,
  };
};
