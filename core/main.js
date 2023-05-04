'use strict';

const path = require('node:path');
const appPath = path.join(__dirname, '../app');
const apiPath = path.join(appPath, './api');
const config = require('./config.js');
const common = require('./lib/common.js');
const db = require('./lib/db.js')(config.db);
const excel = require('./lib/excel.js');
const getClientApi = require('../app/structure/clientApi.js');
const logger = require('./lib/logger.js');
const load = require('./src/loader.js')(config.sandbox);
const loadEnv = require('./src/getEnv.js');
const httpResponses = require('./lib/httpResponses.js');
const transport = require(`./transport/${config.api.transport}.js`);

const sandbox = {
  api: Object.freeze({}),
  console: Object.freeze(logger),
  common: Object.freeze(common),
  db: Object.freeze(db),
  excel: Object.freeze(excel),
  httpResponses: Object.freeze(httpResponses),
  structure: Object.freeze(getClientApi)
};

(async () => {
  await loadEnv();

  const { clientApi } = require('../app/structure/clientApi.js');
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
