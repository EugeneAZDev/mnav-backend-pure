'use strict';

const fsp = require('node:fs').promises;
const path = require('node:path');
const vm = require('node:vm');

const load = async (filePath, sandbox, options) => {
  const src = await fsp.readFile(filePath, 'utf8');
  const code = `'use strict';\n${src}`;
  const script = new vm.Script(code);
  const context = vm.createContext(Object.freeze({ ...sandbox }));
  const exported = script.runInContext(context, options);
  console.log(typeof exported);

  return typeof exported === 'object' ? exported : { method: exported };
};

const loadDir = async (dir, sandbox, options) => {
  const files = await fsp.readdir(dir, { withFileTypes: true });
  const container = {};
  for (const file of files) {
    const { name } = file;
    if (file.isFile() && !name.endsWith('.js')) continue;
    const location = path.join(dir, name);
    const key = path.basename(name, '.js');
    const loader = file.isFile() ? load : loadDir;
    container[key] = await loader(location, sandbox, options);
  }

  return container;
};

module.exports = (options) => async (filePath, sandbox) =>
  loadDir(filePath, sandbox, options);
