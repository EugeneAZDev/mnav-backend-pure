'use strict';

const fsp = require('node:fs').promises;
const path = require('node:path');

const envPath = path.join(process.cwd(), '../../.env');
const read = () => fsp.readFile(envPath, 'utf8');

module.exports = async () => {
  const data = await read();
  const lines = data
    .split('\n')
    .filter((line) => line && !line.startsWith('#'));
  lines.forEach((line) => {
    const [key, value] = line.split('=');
    process.env[key] = value.trim();
  });
};
