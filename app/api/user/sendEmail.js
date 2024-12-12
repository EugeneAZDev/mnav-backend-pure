/* eslint-disable no-undef */
({
  access: 'public',
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, email, url, token, type, inputLocale }) => {
    let buffer;
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
      if (type === 'deleted') {
        const result = await api.user.getItemsValuesCount().method({ clientId });
        if (result.body.countObj.values > 0) {
          buffer = await lib.excel.createExcelFile(clientId);
        }
      };
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
      const modifiedEmailContent = modifiedUrlContent.replace('${email}', email);
      const modifiedUserContent = modifiedEmailContent.replace('${user}', emailUserName);      
      // await common.sendEmail(email, subject, modifiedUserContent, buffer); // TODO TEMP LINE
      if (settings.mode === 'PROD')
        await common.sendEmail(email, subject, modifiedUserContent, buffer);
      else { // `<MOCK.RESULT.EMAIL@uriToReset:${url}>`;
        console.log(`Email to ${email} just sent`);
        console.log(modifiedUserContent);
      };
      return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    };
  },
});
