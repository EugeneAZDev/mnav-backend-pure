({
  method: async (filter, value, fields) =>
    db('User').find(filter, value, fields)
});
