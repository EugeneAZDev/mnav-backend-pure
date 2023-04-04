// api/index.js

const transport = {}

transport.http = (url) => (structure) => {
  console.log('[static.client.http]');
  const api = {};
  const services = Object.keys(structure);
  for (const name of services) {
    api[name] = {};
    const service = structure[name];
    const methods = Object.keys(service);
    for (const method of methods) {
      api[name][method] = (...args) =>
        new Promise((resolve, reject) => {
          console.log(`${url}/api/${name}/${method}`);
          console.log(`args = ${JSON.stringify({ args })}`);
          fetch(`${url}/api/${name}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ args }),
          }).then((res) => {
            if (res.status === 200) resolve(res.json());
            else reject(new Error(`Status Code: ${res.status}`));
          });
        });
    }
  }
  return Promise.resolve(api);
};

transport.ws = (url) => (structure) => {
  // console.log('structure');
  // console.log(structure);
  const socket = new WebSocket(url);
  const api = {};
  const services = Object.keys(structure);
  for (const name of services) {
    api[name] = {};
    const service = structure[name];
    const methods = Object.keys(service);
    for (const method of methods) {
      api[name][method] = (...args) =>
        new Promise((resolve) => {
          const packet = { name, method, args };
          socket.send(JSON.stringify(packet));
          socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            resolve(data);
          };
        });
    }
  }
  return new Promise((resolve) => {
    socket.addEventListener('open', () => resolve(api));
  });
};

const scaffold = (url) => {
  const protocol = url.startsWith('ws:') ? 'ws' : 'http';
  return transport[protocol](url);
};

export default async function apiMethods() {  
  const result = await scaffold('ws://localhost:8001')({
    item: {
      create: ['record'],
      read: ['id']
    },
    user: {
      create: ['record'],
      find: ['fields', 'filter', 'value']
    },
    auth: {
      register: ['id', 'password'],
      login: ['email', 'password']
    }
  });
  return result
}
