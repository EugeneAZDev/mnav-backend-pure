/**
 * node setup useData - fill test data.
 */
'use strict';

const fsp = require('node:fs').promises;
const path = require('node:path');
const pg = require('pg');

const { applyMigrations } = require('../core/migrate');
const { processTransaction } = require('../core/lib/db.js');

const DB = path.join(__dirname, './db');

const CONNECTION = {
  host: '127.0.0.1',
  port: 7000,
  database: 'mnav',
  user: 'admin',
  password: 'admin',
};

const read = (name) => fsp.readFile(path.join(DB, name), 'utf8');

const execute = async (client, sql) => {
  try {
    await client.query(sql);
  } catch (err) {
    console.error(err);
  }
};

const notEmpty = (s) => s.trim() !== '';

const executeFile = async (client, name) => {
  console.log(`Execute file: ${name}`);
  const sql = await read(name);
  const commands = sql.split(';\n').filter(notEmpty);
  for (const command of commands) {
    await execute(client, command);
  }
};

(async () => {
  const argsList = process.argv.slice(2);
  const useData = argsList.find((arg) => arg === 'useData');
  const db = new pg.Client(CONNECTION);
  await db.connect();
  await executeFile(db, 'reset.sql');
  await executeFile(db, 'structure.sql');
  await processTransaction(applyMigrations);
  if (useData) await executeFile(db, 'data.sql');
  await db.end();
  console.log('Environment is ready');
})().catch((err) => {
  console.error(err);
});
