'use strict';

const path = require('node:path');
const logger = require('./lib/logger.js');
const common = require('./lib/common.js');

const config = require('./config.js');

const load = require('./lib/load.js')(config.sandbox);
const db = require('./lib/db.js')(config.db);
const transport = require(`./transport/${config.api.transport}.js`);

const sandbox = {
  api: Object.freeze({}),
  db: Object.freeze(db),
  console: Object.freeze(logger),
  common: Object.freeze(common),
};
const apiPath = path.join(process.cwd(), './api');

(async () => {
  const routing = await load(apiPath, sandbox);
  transport(routing, config.api.port, logger);
})();
