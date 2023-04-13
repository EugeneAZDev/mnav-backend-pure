({
  method: async (id) => db('User').read(id, ['id', 'email'])
});
