({
  method: async ({ filter, value }) =>
    db('User').find(filter, value, ['id', 'email'])
});
