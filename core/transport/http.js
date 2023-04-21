'use strict';

const http = require('node:http');

const TRY_LIMITATIONS = 10000;
const TRY_LIMIT = 3;
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const REQUEST_LIMITS = [
  { interval: MINUTE, limit: TRY_LIMIT, delay: 10 * MINUTE },
  { interval: 10 * MINUTE, limit: TRY_LIMIT * 2, delay: 30 * MINUTE },
  { interval: 30 * MINUTE, limit: TRY_LIMIT * 3, delay: 3 * HOUR },
  { interval: 3 * HOUR, limit: TRY_LIMIT * 4, delay: 24 * HOUR },
];

const HEADERS = {
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json; charset=UTF-8',
};

const ipRequestCountMap = new Map();

const Client = require('../src/client.js');

const receiveArgs = async (req) => {
  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  const data = Buffer.concat(buffers).toString();
  try {
    if (data.length > 0) return JSON.parse(data);
    else return {};
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = (routing, port, console) => {
  http
    .createServer(async (req, res) => {
      const client = await Client.getInstance(req, res);
      res.writeHead(200, HEADERS);

      if (req.method !== 'POST') return res.end('"Method not found"');
      const { url, socket } = req;
      const [ place, name, method ] = url.substring(1).split('/');
      console.log(`${socket.remoteAddress} ${method} ${url}`);
      if (place !== 'api') return res.end('"API not found"');
      const entity = routing[name.toLowerCase()];
      if (!entity) return res.end('"Entity not found"');

      const handler = entity[method];
      if (!handler) return res.end('"Handler not found"');

      if (!handler().access || handler().access !== 'public') {
        if (!client.id) {
          res.writeHead(401, HEADERS);
          res.end(JSON.stringify({ message: 'Unauthorized' }));
        }
      }

      // Limit requests for "user/find" endpoint
      if (name.toLowerCase() === 'user' && method.toLowerCase() === 'find') {
        const now = Date.now();
        const ip = req.socket.remoteAddress;

        let ipRequestCount = ipRequestCountMap.get(ip);
        if (!ipRequestCount) {
          ipRequestCount = [];
          ipRequestCountMap.set(ip, ipRequestCount);
        }

        let requestLimit;
        for (let i = REQUEST_LIMITS.length - 1; i >= 0; i--) {
          if (
            ipRequestCount.filter(
              (timestamp) => now - timestamp < REQUEST_LIMITS[i].interval,
            ).length >= REQUEST_LIMITS[i].limit
          ) {
            requestLimit = REQUEST_LIMITS[i];
            break;
          }
        }

        if (requestLimit) {
          const remainingTime =
            requestLimit.delay -
            (now - ipRequestCount[ipRequestCount.length - requestLimit.limit]);
          res.writeHead(429, HEADERS);
          res.end(
            `Too Many Requests. Please try again in ${Math.ceil(
              (remainingTime / MINUTE) % 60,
            )} minutes.`,
          );
          return;
        }

        ipRequestCount.push(now);
        if (ipRequestCount.length > TRY_LIMITATIONS) {
          ipRequestCount.shift();
        }
      }

      const { args } = await receiveArgs(req);
      const result = await handler().method({ ...args });
      if (result.error) {
        console.log(result.error);
      }

      res.writeHead(result.code, HEADERS);
      res.end(JSON.stringify(result.body));
    })
    .listen(port);

  console.log(`Http API on port ${port}`);
};
