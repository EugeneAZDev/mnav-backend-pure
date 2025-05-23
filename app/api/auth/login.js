({
  access: 'public',
  method: async ({ email, password }) => {
    try {
      const result = await crud('User').select({
        where: { email: email.toLowerCase() },
      });
      if (result.rows.length === 1) {
        const [user] = result.rows;
        if (user.password === null) {
          if (!user.gAuthId) {
            return responseType.modifiedBodyTemplate(responseType.error, {
              message: 'Unable to login: Complete the registration',
            });
          } else {
            return responseType.modifiedBodyTemplate(responseType.error, {
              message:
                'Password is not set: User has been registered via Google',
            });
          }

        }
        const valid = await common.validatePassword(password, user.password);
        if (valid) {
          const token = await common.generateToken(user.id);
          return responseType.modifiedBodyTemplate(responseType.success, {
            token,
          });
        }
      }

      return responseType.unauthorized();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
