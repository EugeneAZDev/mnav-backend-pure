async (pool, clientId, excelData) => {
  await pool.query(`
    UPDATE "ItemValue" SET "deletedAt" = NOW()
    WHERE id IN (
      SELECT iv.id FROM "ItemValue" iv
        JOIN "Item" i ON iv."itemId" = i.id
      WHERE i."userId" = ${clientId} AND iv."deletedAt" IS NULL
    );

    UPDATE "Item" SET "deletedAt" = NOW()
    WHERE "userId" = ${clientId} AND "deletedAt" IS NULL;

    UPDATE "ItemSection" SET "deletedAt" = NOW()
    WHERE "userId" = ${clientId} AND "deletedAt" IS NULL;
  `);  
  const sections = [
    ...new Set(
      excelData.filter((x) => x.section !== undefined).map((x) => x.section),
    ),
  ].map((section) => ({ userId: clientId, title: section }));
  let addedSections;
  if (sections.length > 0) {
    const { rows } = await crud('ItemSection').create(sections, pool);
    addedSections = rows;
  }
  const sectionsCount = addedSections?.length || 0;  
  const items = excelData.map((item) => {
    const section =
      addedSections && addedSections.find((s) => s.title === item.section)?.id;
    const sectionId = section && parseInt(section, 10);
    return {
      description: item.description,
      target: item.target,
      title: item.title,
      valueType: item.valueType,
      valueAssessment: item.valueAssessment,
      sectionId,
      userId: clientId,
    };
  });
  const { rows: addedItems } = await crud('Item').create(items, pool);
  const itemsCount = addedItems?.length || 0;
  let valuesCount = 0;
  const values = excelData.map((record) => {
    const item = addedItems.find((item) => item.title === record.title);
    valuesCount = valuesCount + (record.values.length || 0);
    return record.values.map((v) => ({
      itemId: parseInt(item.id),
      value: v.value,
      createdAt: new Date(v.time),
    }));
  });    
  // const deletedAt = await domain.getLocalTime(clientId);
  await crud('ItemValue').create(values.flat(), pool);
  await crud('ValueDetail').update({
    fields: { deletedAt: new Date() },
    transaction: pool,
  });
  await domain.sync.updateSyncToFalse(pool, clientId, true);
  return { 
    sections: sectionsCount,
    items: itemsCount,
    values: valuesCount,
  };
};
