'use strict';

const { rollbackMigrations } = require('./');
const { processTransaction } = require('../../core/lib/db.js');

(async () => {
  try {
    await processTransaction(rollbackMigrations);
  } catch (e) {
    console.log(e);
  }
})();
