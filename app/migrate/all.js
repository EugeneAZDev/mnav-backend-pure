'use strict';

const { applyMigrations } = require('./index.js');
const { processTransaction } = require('../../core/lib/db.js');

(async () => {
  try {
    await processTransaction(applyMigrations);
  } catch (e) {
    console.log(e);
  }
})();
