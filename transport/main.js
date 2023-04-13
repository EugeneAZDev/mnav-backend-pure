'use strict';

const path = require('node:path');

const logger = require('./lib/logger.js');
const common = require('./lib/common.js');

const appPath = path.join(process.cwd(), '../app');
const apiPath = path.join(appPath, './api');

const config = require('./config.js');

const load = require('./src/loader.js')(config.sandbox);
const db = require('./lib/db.js')(config.db);
const transport = require(`./transport/${config.api.transport}.js`);

const sandbox = {
  api: Object.freeze({}),
  db: Object.freeze(db),
  console: Object.freeze(logger),
  common: Object.freeze(common),
};

(async () => {
  const routing = await load(apiPath, sandbox, true);
  transport(routing, config.api.port, logger);
})();
