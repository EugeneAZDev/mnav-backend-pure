async (clientId) => {
  const result = await crud('User').select({
    id: clientId,
    fields: ['locale'],
  });
  if (result.rows.length === 1) {
    const [row] = result.rows;
    return row.locale;
  }
  return 'en';
};
