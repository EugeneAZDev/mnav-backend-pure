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
const INITIAL_HEADERS = {
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

const limitRequests = (headers, req, res) => {
  const now = Date.now();
  const ip = req.socket.remoteAddress;
  let requestLimit;
  let ipRequestCount = ipRequestCountMap.get(ip);
  if (!ipRequestCount) {
    ipRequestCount = [];
    ipRequestCountMap.set(ip, ipRequestCount);
  }
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
    res.writeHead(429, headers);
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
};

const receiveArgs = async (req) => {
  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  const resultBuffer = Buffer.concat(buffers);
  try {
    const data = resultBuffer.toString();
    if (data.includes('Content-Disposition: form-data;'))
      return {
        file: resultBuffer,
      };
    else if (data.length > 0) return JSON.parse(data);
    else return {};
  } catch (err) {
    throw new Error(err.message);
  }
};

const resEnd = (res, code, headers) => (message) => {
  res.writeHead(code, headers);
  res.end(message);
};

module.exports = (routing, port, console) => {
  http
    .createServer(async (req, res) => {
      const headers = { ...INITIAL_HEADERS };
      const client = await Client.getInstance(req, res);
      const resEnd400 = resEnd(res, 400, headers);

      if (req.method === 'OPTIONS') {
        resEnd(res, 200, headers)();
        return;
      }

      if (req.method !== 'POST') {
        resEnd400('"Method not found"');
        return;
      }
      const { url, socket } = req;
      const [place, name, method] = url.substring(1).split('/');
      console.log(`${socket.remoteAddress} ${method} ${url}`);
      if (place !== 'api') {
        resEnd400('"API not found"');
        return;
      }
      const entity = routing[name.toLowerCase()];
      if (!entity) {
        resEnd400('"Entity not found"');
        return;
      }
      const handler = entity[method];
      if (!handler) {
        resEnd400('"Handler not found"');
        return;
      }
      if (!handler().access || handler().access !== 'public') {
        if (!client.id) {
          const message = JSON.stringify({ message: 'Unauthorized' });
          resEnd(res, 401, headers)(message);
          return;
        }
      }
      if (name.toLowerCase() === 'user' && method.toLowerCase() === 'find') {
        limitRequests(headers, req, res);
      }
      const { args, file } = await receiveArgs(req);
      const records = { ...args, clientId: client.id };
      if (file) records.file = file;
      const result = await handler().method(records);
      if (result.extraHeaders) {
        Object.assign(headers, result.extraHeaders);
      }
      if (result.error) {
        console.log(result.error);
      }
      res.writeHead(result.code, headers);
      if (result.buffer) {
        res.end(result.buffer);
        return;
      } else {
        res.end(JSON.stringify(result.body));
        return;
      }
    })
    .listen(port);

  console.log(`Http API on port ${port}`);
};
