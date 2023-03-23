({
  async read(id) {
    return db('Item').read(id); // or .read(id, ['title']);
  }
});
