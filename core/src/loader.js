'use strict';

const fsp = require('node:fs').promises;
const path = require('node:path');
const vm = require('node:vm');

const load = async (filePath, sandbox, contextualize = false, options) => {
  const src = await fsp.readFile(filePath, 'utf8');
  const opening = contextualize ? '(context) => ' : '';
  const code = `'use strict';\n${opening}${src}`;
  const script = new vm.Script(code, { ...options, lineOffset: -1 });
  // const context = vm.createContext(Object.freeze({ ...sandbox }));
  return script.runInContext(sandbox, options);
};

const loadDir = async (dir, sandbox, contextualize = false, options) => {
  const files = await fsp.readdir(dir, { withFileTypes: true });
  const container = {};
  for (const file of files) {
    const { name } = file;
    if (file.isFile() && !name.endsWith('.js')) continue;
    const location = path.join(dir, name);
    const key = path.basename(name, '.js');
    const loader = file.isFile() ? load : loadDir;
    container[key] = await loader(location, sandbox, contextualize, options);
  }
  return container;
};

module.exports =
  (options) =>
    async (filePath, sandbox, contextualize) =>
      loadDir(filePath, sandbox, contextualize, options);
