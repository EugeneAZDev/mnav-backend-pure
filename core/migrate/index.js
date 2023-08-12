'use strict';

require('../src/getEnv.js');

const fsp = require('node:fs').promises;
const path = require('node:path');

const dir = path.join(__dirname, '../../app/db/migrations');
const MIGRATION_TABLE = 'Migration';

async function checkMigrationsTable(pool) {
  const query = `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_name = '${MIGRATION_TABLE}'
    );
  `;
  const result = await pool.query(query);
  return result.rows[0].exists;
}

async function createMigrationsTable(pool) {
  const query = `
    CREATE TABLE "${MIGRATION_TABLE}" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      executed_at timestamp WITHOUT time ZONE DEFAULT now()
    );
  `;
  await pool.query(query);
}

async function getAvailableMigrations(desc = false) {
  const files = await fsp.readdir(dir);

  const result = files
    .filter((file) => file.endsWith('.js'))
    .map((file) => {
      const migration = require(path.join(dir, file));
      return {
        name: file.replace('.js', ''),
        up: migration.up,
        down: migration.down,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  if (desc) { return result.reverse(); }
  return result;
}

async function getExecutedMigrations(pool, desc = false) {
  const direction = desc ? 'DESC' : 'ASC';
  const query =
    `SELECT name FROM "${MIGRATION_TABLE}" ORDER BY id ${direction};`;
  const result = await pool.query(query);
  return result.rows.map((row) => row.name);
}

async function addMigrationRecord(pool, migrationName) {
  const insertQuery = `
    INSERT INTO "${MIGRATION_TABLE}" (name) VALUES ($1);
  `;
  await pool.query(insertQuery, [migrationName]);
}

async function deleteMigrationRecord(pool, migrationName) {
  const query = `
    DELETE FROM "${MIGRATION_TABLE}" WHERE name = $1;
  `;
  await pool.query(query, [migrationName]);
}

async function migrate(pool, up = false) {
  const migrationTableExists = await checkMigrationsTable(pool);
  if (!migrationTableExists) await createMigrationsTable(pool);
  const availableMigrations = await getAvailableMigrations();
  const executedMigrations = await getExecutedMigrations(pool);
  for await (const migration of availableMigrations) {
    if (!executedMigrations.includes(migration.name)) {
      console.log(`Executing migration: ${migration.name}`);
      await migration.up(pool);
      await addMigrationRecord(pool, migration.name);
      if (up) {
        console.log('Migration executed successfully.');
        return;
      }
    }
  }
  console.log('All migrations have been executed successfully.');
}

async function revert(pool, down = false) {
  const availableMigrations = await getAvailableMigrations(true);
  const executedMigrations = await getExecutedMigrations(pool, true);
  for (const migration of availableMigrations) {
    if (executedMigrations.includes(migration.name)) {
      console.log(`Rolling back migration: ${migration.name}`);
      await migration.down(pool);
      await deleteMigrationRecord(pool, migration.name);
      if (down) {
        console.log('Migration rolled back successfully.');
        return;
      }
    }
  }
  console.log('All migrations have been rolled back.');
}

async function applyMigrations(pool) { await migrate(pool); }
async function up(pool) { await migrate(pool, true); }
async function rollbackMigrations(pool) { await revert(pool); }
async function down(pool) { await revert(pool, true); }

module.exports = {
  applyMigrations, up, rollbackMigrations, down
};
