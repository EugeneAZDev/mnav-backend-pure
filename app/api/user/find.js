({
  method: async (email) =>
    db('User').find('email', email.toLowerCase(), ['id', 'email'])
});
