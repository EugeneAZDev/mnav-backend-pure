'use strict';

const fsp = require('node:fs').promises;
const path = require('node:path');

const dir = path.join(__dirname, './db/migrations');
const { processTransaction } = require('../core/lib/db.js');

async function checkMigrationsTable(pool) {
  const query = `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_name = 'migrations'
    );
  `;
  const result = await pool.query(query);
  return result.rows[0].exists;
}

async function createMigrationsTable(pool) {
  const query = `
    CREATE TABLE "Migration" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      executed_at TIMESTAMPTZ DEFAULT NOW(),
      rolled_back_at TIMESTAMPTZ
    );
  `;
  await pool.query(query);
}


async function runMigrations(pool) {
  const migrationTableExists = await checkMigrationsTable(pool);
  if (!migrationTableExists) {
    await createMigrationsTable(pool);
  }
}

(async () => {
  try {
    await processTransaction(runMigrations);
  } catch (e) {
    console.log(e);
  }

})();
