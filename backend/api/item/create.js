({
  async create(...record) {
    return db('Item').create(...record);
  }
});
