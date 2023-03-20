({
  async create(...record) {
    return db('Item').create(...record);
  },

  async read(id) {
    return db('Item').read(id); // or .read(id, ['title']);
  }
});
