/* eslint-disable no-undef */
({
  access: 'public',
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, email, url, token, type, inputLocale }) => {
    try {      
      if (type === 'reset') {        
        await crud('User').update({
          id: clientId,
          fields: {
            password: '',
            token,
          },
        });
      }

      const locale = inputLocale || (await domain.user.getLocale(clientId));
      const { subject, content } = common.getEmailContent(
        settings.appPath,
        locale,
        type,
      );

      const [ userName ] = email.split('@');
      const modifiedUrlContent = content.replace('${url}', url);
      const modifiedContent = modifiedUrlContent.replace('${user}', userName);

      if (settings.mode === 'PROD')
        await common.sendEmail(email, subject, modifiedContent);
      else {
        console.log('Send Email');
        console.log(modifiedContent);
      } // `<MOCK.RESULT.EMAIL@uriToReset:${url}>`;

      return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
