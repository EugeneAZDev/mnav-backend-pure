async (pool, userId, email) => {
  let codeInText = '';
  Array.from({ length: 5 }, () => Math
    .floor(Math.random() * (9 - 1 + 1)) + 1)
    .map(item => codeInText += item.toString()
  );
  const digitCode = parseInt(codeInText);
  await crud('User').update({
    id: userId,
    fields: { digitCode },
    transaction: pool
  });
  
  const locale = await domain.user.getLocale(userId);
  const { subject, content } = common.getEmailContent(
    settings.appPath,
    locale,
    'code',
  );
  const modifiedContent = content.replace(/\${code}/g, digitCode);
  if (settings.mode === 'PROD')
    await common.sendEmail(email, subject, modifiedContent);
  else {
    console.log('Send Email, code:', digitCode);
    // console.log(email + '\n', subject + '\n', modifiedContent + '\n');
  } // `<MOCK.RESULT.EMAIL@uriToReset:${url}>`;
  return true;
};
