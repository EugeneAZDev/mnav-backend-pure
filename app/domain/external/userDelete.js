async (pool, deletionToken) => {
  const result = deletionToken && await crud('User').select({
    fields: [ 'id', 'email', 'locale' ],
    where: { deletionToken },
    transaction: pool,
  });  
  if (result.rows.length === 1) {
    const [ user ] = result.rows;
    const locale = user.locale;
    if (user) {
      const sent = await api.user.sendEmail().method({
        clientId: user.id,
        email: user.email,
        url: undefined,
        token: undefined,
        type: 'deleted',
        inputLocale: user.locale,
      });
      if (sent.code === 200) {
        const destroyCountsResult = await api.user.destroy().method({ clientId: user.id });
        return { ...destroyCountsResult, locale };
      }
    }
  } else {
    return responseType.notFound();
  }
};
