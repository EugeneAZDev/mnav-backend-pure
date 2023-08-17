({
  access: 'public',
  method: async ({ email, password }) => {
    try {
      const result = await crud('User').select({
        where: { email: email.toLowerCase() }
      });
      if (result.rows.length === 1) {
        const [user] = result.rows;
        if (user.password === null)
          return responseType.modifiedBodyTemplate(responseType.error, {
            message: 'Unable to login: Complete the registration',
          });
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
