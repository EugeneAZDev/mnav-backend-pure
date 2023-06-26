'use strict';
const loadEnv = require('./src/getEnv.js');
(async () => {
  await loadEnv();
  require('./server.js');
})();
