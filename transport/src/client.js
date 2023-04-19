'use strict';

const common = require('../lib/common.js');

const getToken = (headers) => {
  const authHeader = headers['authorization'];
  if (authHeader && authHeader.includes('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    if (token) return token;
  }
};

const parseHost = (host) => {
  if (!host) return 'no-host-name-in-http-headers';
  const portOffset = host.indexOf(':');
  if (portOffset > -1) host = host.substr(0, portOffset);
  return host;
};

class Client {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.host = parseHost(req.headers.host);
    this.token = undefined;
    this.id = undefined;
  }

  static async getInstance(req, res) {
    const client = new Client(req, res);
    const token = getToken(req.headers);
    if (token) {
      const { userId } = common.validateToken(token);
      client.id = userId;
      client.token = token;
    }
    return client;
  }
}

module.exports = Client;
