'use strict';

const { up } = require('./');
const { processTransaction } = require('../../core/lib/db.js');

(async () => {
  try {
    await processTransaction(up);
  } catch (e) {
    console.log(e);
  }
})();
