({
  access: 'public',
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, email, url }) => {
    try {
      const result = await common.sendEmail(email, url);
      console.log(result);
      return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
