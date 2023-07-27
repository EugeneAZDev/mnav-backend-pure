'use strict';

const { down } = require('./');
const { processTransaction } = require('../../core/lib/db.js');

(async () => {
  try {
    await processTransaction(down);
  } catch (e) {
    console.log(e);
  }
})();
