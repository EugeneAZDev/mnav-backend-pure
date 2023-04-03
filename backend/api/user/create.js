({ method: async (...record) => db('User').create(...record) });
