'use strict';

const { up } = require('./');
const { processTransaction } = require('../lib/db.js');

(async () => {
  try {
    await processTransaction(up);
  } catch (e) {
    console.log(e);
  }
})();
