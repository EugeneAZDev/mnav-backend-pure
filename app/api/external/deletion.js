/* eslint-disable no-undef */
// User Deletion Link
({
  access: 'public',
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, ...payload }) => {
    try {
      const { deletionToken } = payload;
      if (!deletionToken) {
        const html = common.getHtmlContent(settings.appPath, 'en', 'error');
        return { ...responseType.success(), html };
      }
      const deletionResult = await db.processTransaction(
        domain.external.userDelete, deletionToken
      );
      let html;
      if (deletionResult.code === 200)
        html = common.getHtmlContent(
          settings.appPath,
          deletionResult.locale,
          'delete',
          deletionResult.body.counts
        );
      else html = common.getHtmlContent(settings.appPath, 'en', 'error');
      return { ...responseType.success(), html };
    } catch (error) {
      console.log(error);
      const html = common.getHtmlContent(settings.appPath, 'en', 'error');
      return { ...responseType.success(), html };
    }
  },
});
