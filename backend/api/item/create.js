({ method: async (...record) => db('Item').create(...record) });
