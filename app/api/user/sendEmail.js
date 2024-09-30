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

      const [ emailName ] = email.split('@');
      const userNameInfo = emailName.split('.');
      const emailUserName = 
        userNameInfo.length == 2 ?
          `${userNameInfo[0].charAt(0).toUpperCase() + userNameInfo[0].slice(1)} ${userNameInfo[1].charAt(0).toUpperCase() + userNameInfo[1].slice(1)}` :
          emailName.charAt(0).toUpperCase() + emailName.slice(1);

      const modifiedUrlContent = content.replace('${url}', url);
      const modifiedUserContent = modifiedUrlContent.replace('${user}', emailUserName);

      if (settings.mode === 'PROD')
        await common.sendEmail(email, subject, modifiedUserContent);
      else {
        console.log('Send Email');
        console.log(modifiedUserContent);
      } // `<MOCK.RESULT.EMAIL@uriToReset:${url}>`;

      return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
