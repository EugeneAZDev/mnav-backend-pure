({
  access: 'public',
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, email, url }) => {
    try {
      const result =
        mode === 'PROD' ?
          await common.sendEmail(email, url) :
          `<MOCK.RESULT.EMAIL@uriToReset:${url}>`;
      console.log(`messageId: ${result}`);
      return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
