/**
 * Accepted for Postman
 * but needed to re-write function for Scaffolding on client side
 */
'use strict';

const http = require('node:http');

const HEADERS = {
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=UTF-8',
};

const receiveArgs = async (req) => {
  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  const data = Buffer.concat(buffers).toString();
  try {
    return JSON.parse(data);
  } catch (err) {
    throw new Error(err.message);
  }
};

const crud = { get: 'read', post: 'create', put: 'update', delete: 'delete' };

module.exports = (routing, port, console) => {
  http
    .createServer(async (req, res) => {
      res.writeHead(200, HEADERS);
      const { method, url, socket } = req;
      console.log(`${socket.remoteAddress} ${method} ${url}`);
      const [name, id] = url.substring(1).split('/');
      const entity = routing[name.toLowerCase()];
      if (!entity) return res.end('Entity not found');
      const procedure =
        id === undefined ?
          crud[method.toLowerCase()] :
          isNaN(id) ? id : crud[method.toLowerCase()];
      const handler = entity[procedure];
      if (!handler) return res.end('Handler not found');
      const args = [];
      const src = handler.toString().split('method: ')[1]; console.log(src);
      const signature = src.substring(0, src.indexOf(')'));
      if (signature.includes('(id')) args.push(id);
      if (signature.includes('{')) args.push(await receiveArgs(req));
      const result = await handler().method(...args);
      res.end(JSON.stringify(result.rows));
    })
    .listen(port);

  console.log(`Rest http API on port ${port}`);
};
