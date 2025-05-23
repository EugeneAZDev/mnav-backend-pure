({
  access: 'public',
  method: async ({ credential, publicKey }) => {
    try {
      const ticket = await common.oAuth2Client.verifyIdToken({
        idToken: credential,
        audience: publicKey,
      });
      const payload = ticket.getPayload();
      const googleUserId = payload['sub'];
      const email = payload['email'];
      if (googleUserId && email) {
        const userId = await db.processTransaction(
          domain.auth.google,
          googleUserId,
          email,
        );
        const token = await common.generateToken(userId);
        return responseType.modifiedBodyTemplate(responseType.success, {
          token, email
        });
      }

      return responseType.unauthorized();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
