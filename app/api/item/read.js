({
  method: async (id) => db('Item').read(id) // or .read(id, ['title']);
});
