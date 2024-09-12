({
  access: 'public',
  method: async ({ clientId, token, code }) => {
    try {
      let verificationResult = false;
      const getUserQuery = await crud('User').select({
        id: clientId,
        fields: ['id', 'email', 'token', 'digitCode'],
      });
      if (getUserQuery.rows.length === 1) {
        const [user] = getUserQuery.rows;
        console.log(user);
        if (user.token !== token) {
          console.debug(`Strange Activity for userId ${clientId}! Possible continue to register with another website/app`);
        }
        if (parseInt(user.digitCode) === parseInt(code)) verificationResult = true;
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        verificationResult,
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
