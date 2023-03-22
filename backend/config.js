'use strict';

module.exports = {
  api: {
    port: 8001,
    transport: 'ws',
  },
  sandbox: {
    timeout: 5000,
    displayErrors: false,
  },
  db: {
    host: '127.0.0.1',
    port: 5432,
    database: 'mnav',
    user: 'admin',
    password: 'admin',
  }
};
