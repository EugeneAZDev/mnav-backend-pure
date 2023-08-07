'use strict';

const config = require('../config');
const pg = require('pg');

const processTransaction = async (fn, ...args) => {
  const pool = args.pool ? args.pool : new pg.Pool(config.db);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client, ...args);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    pool.end();
  }
};

module.exports = { processTransaction };
