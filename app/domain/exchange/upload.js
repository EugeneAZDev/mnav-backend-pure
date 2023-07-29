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

  const { rows: addedSections } = await crud('ItemSection').create(
    sections,
    pool,
  );

  const items = excelData.map((item) => {
    const section = addedSections.find((s) => s.title === item.section)?.id;
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

  const values = excelData.map((record) => {
    const item = addedItems.find((item) => item.title === record.title);
    return record.values.map((v) => ({
      itemId: parseInt(item.id),
      value: v.value,
      createdAt: new Date(v.time),
    }));
  });

  await crud('ItemValue').create(values.flat(), pool);
  await crud('ValueDetail').delete(pool);
};
