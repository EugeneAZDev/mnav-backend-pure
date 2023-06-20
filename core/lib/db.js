'use strict';

const config = require('../config');
const pg = require('pg');
const pool = new pg.Pool(config.db);

const processTransaction = async (fn, ...args) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await fn(client, ...args);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    pool.end();
  }
};

module.exports = { processTransaction };
