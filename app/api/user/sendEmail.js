/* eslint-disable no-undef */
({
  access: 'public',
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, email, url, type, inputLocale }) => {
    try {
      const locale = inputLocale || (await domain.user.getLocale(clientId));
      const { subject, content } = common.getEmailContent(
        settings.appPath,
        locale,
        type,
      );
      const modifiedContent = content.replace('${url}', url);

      if (settings.mode === 'PROD')
        await common.sendEmail(email, subject, modifiedContent);
      else {
        console.log('Send Email');
        console.log(JSON.parse(modifiedContent))
      } // `<MOCK.RESULT.EMAIL@uriToReset:${url}>`;

      return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
