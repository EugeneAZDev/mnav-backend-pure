'use strict';

require('../../core/src/getEnv.js')

const fsp = require('node:fs').promises;
const path = require('node:path');

const dir = path.join(__dirname, '../db/migrations');

const MIGRATION_TABLE = 'Migration'

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
      executed_at timestamp WITHOUT time ZONE DEFAULT now(),
      rolled_back_at timestamp WITHOUT time ZONE
    );
  `;
  await pool.query(query);
}

async function getAvailableMigrations() {
  const files = await fsp.readdir(dir);

  return files
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const migration = require(path.join(dir, file));
      return {
        name: file.replace('.js', ''),
        up: migration.up,
        down: migration.down,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function getExecutedMigrations(pool) {
  const query = `SELECT name FROM "${MIGRATION_TABLE}" ORDER BY id ASC;`;
  const result = await pool.query(query);
  return result.rows.map(row => row.name);
}

async function addMigrationRecord(pool, migrationName) {
  const insertQuery = `
    INSERT INTO "${MIGRATION_TABLE}" (name) VALUES ($1);
  `;
  await pool.query(insertQuery, [migrationName]);
}

async function updateMigrationRecord(pool, migrationName) {
  const query = `
    UPDATE "${MIGRATION_TABLE}"
    SET rolled_back_at = NOW()
    WHERE name = $1;
  `;
  await pool.query(query, [migrationName]);
}

async function applyMigrations(pool) {
  const migrationTableExists = await checkMigrationsTable(pool);
  if (!migrationTableExists) await createMigrationsTable(pool);
  const availableMigrations = await getAvailableMigrations();
  const executedMigrations = await getExecutedMigrations(pool);
  for await (const migration of availableMigrations) {
    if (!executedMigrations.includes(migration.name)) {
      console.log(`Executing migration: ${migration.name}`);
      await migration.up(pool);
      await addMigrationRecord(pool, migration.name);
      console.log('Migration executed successfully.');
    }
  }
}

async function rollbackMigrations(pool) {
  const availableMigrations = await getAvailableMigrations();
  const executedMigrations = await getExecutedMigrations(pool);
  for (const migration of availableMigrations) {
    if (executedMigrations.includes(migration.name)) {
      console.log(`Rolling back migration: ${migration.name}`);
      await migration.down(pool);
      await updateMigrationRecord(pool, migration.name);
      console.log('Migration rolled back successfully.');
    }
  }
  console.log('All migrations have been rolled back.');
}

module.exports = {
  applyMigrations, rollbackMigrations
}
