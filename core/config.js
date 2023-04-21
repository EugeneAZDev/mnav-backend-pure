'use strict';

module.exports = {
  api: {
    port: 8001,
    transport: 'http',
  },
  sandbox: {
    timeout: 5000,
    displayErrors: false,
  },
  db: {
    host: '127.0.0.1',
    port: 7000,
    database: 'mnav',
    user: 'admin',
    password: 'admin',
  }
};
