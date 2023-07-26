'use strict';

const fs = require('node:fs');
const path = require('node:path');
const envPath = path.join(process.cwd(), '../../../.env');
const read = () => fs.readFileSync(envPath, 'utf8');

module.exports = (() => {
  const data = read();
  const lines = data
    .split('\n')
    .filter((line) => line && !line.startsWith('#'));
  lines.forEach((line) => {
    const [key, value] = line.split('=');
    process.env[key] = value.trim();
  });
})();
