'use strict';
require('./src/getEnv.js')
const config = require('./config.js');
const common = require('./lib/common.js');
const crud = require('./lib/crud.js')(config.db);
const db = require('./lib/db.js');
const load = require('./src/loader.js')(config.sandbox);
const logger = require('./lib/logger.js');
const responseType = require('./lib/responseType.js');
const transport = require('./transport.js');
const vm = require('node:vm');

const path = require('node:path');
const appPath = path.join(__dirname, '../app');
const apiPath = path.join(appPath, './api');
const domainPath = path.join(appPath, './domain');
const libPath = path.join(appPath, './lib');

const sandbox = {
  console: Object.freeze(logger),
  common: Object.freeze(common),
  crud: Object.freeze(crud),
  db: Object.freeze(db),
  responseType: Object.freeze(responseType),
  setting: Object.freeze({ mode: process.env.MODE }),
};
const context = vm.createContext(sandbox);

(async () => {
  const api = await load(apiPath, context, true);
  const domain = await load(domainPath, context);
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
  context.domain = Object.freeze(domain);
  context.lib = Object.freeze(lib);
  const routing = await load(apiPath, context, true);
  transport(routing, config.api.port, logger);
})();
