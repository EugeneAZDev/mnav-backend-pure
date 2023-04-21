'use strict';

const path = require('node:path');

const logger = require('./lib/logger.js');
const common = require('./lib/common.js');
const httpResponses = require('./lib/httpResponses.js');

const appPath = path.join(__dirname, '../app');
const apiPath = path.join(appPath, './api');

const config = require('./config.js');

const load = require('./src/loader.js')(config.sandbox);
const loadEnv = require('./src/getEnv.js');

const db = require('./lib/db.js')(config.db);
const transport = require(`./transport/${config.api.transport}.js`);
const getClientApi = require('../app/static/structure.js');
const sandbox = {
  api: Object.freeze({}),
  db: Object.freeze(db),
  console: Object.freeze(logger),
  common: Object.freeze(common),
  httpResponses: Object.freeze(httpResponses),
  structure: Object.freeze(getClientApi)
};

(async () => {
  await loadEnv();

  const { clientApi } = require('../app/static/structure.js');
  const routing = await load(apiPath, sandbox, true);

  // Fill client structure api
  for (const name in routing) {
    clientApi[name] = {};
    const entity = routing[name];
    for (const method in entity) {
      const handler = entity[method];
      const str = handler.toString().split('method: ')[1].split('=> ')[0];
      const args = common.extractArguments(str);
      clientApi[name][method] = args;
    }
  }

  transport(routing, config.api.port, logger);
})();
