'use strict';
const config = require('./config.js');
const common = require('./lib/common.js');
const db = require('./lib/db.js')(config.db);
const load = require('./src/loader.js')(config.sandbox);
const loadEnv = require('./src/getEnv.js');
const logger = require('./lib/logger.js');
const responseType = require('./lib/responseType.js');
const transport = require(`./transport/${config.api.transport}.js`);
const vm = require('node:vm');

const path = require('node:path');
const appPath = path.join(__dirname, '../app');
const apiPath = path.join(appPath, './api');
const libPath = path.join(appPath, './lib');

const sandbox = {
  console: Object.freeze(logger),
  common: Object.freeze(common),
  db: Object.freeze(db),
  responseType: Object.freeze(responseType),
};
const context = vm.createContext(sandbox);

(async () => {
  await loadEnv();
  const api = await load(apiPath, context, true);
  const lib = await load(libPath, context);
  const clientApi = lib.client.api.get();
  for (const name in api) {
    clientApi[name] = {};
    const entity = api[name];
    for (const method in entity) {
      const handler = entity[method];
      const str = handler.toString().split('method: ')[1].split('=> ')[0];
      const args = common.extractArguments(str);
      clientApi[name][method] = args;
    }
  }
  context.api = Object.freeze(api);
  context.lib = Object.freeze(lib);

  const routing = await load(apiPath, context, true);
  transport(routing, config.api.port, logger);
})();
