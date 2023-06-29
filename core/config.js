'use strict';

module.exports = {
  api: {
    port: parseInt(process.env.API_PORT),
  },
  sandbox: {
    timeout: parseInt(process.env.SANDBOX_TIMEOUT),
    displayErrors: false,
  },
  db: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
  }
};
