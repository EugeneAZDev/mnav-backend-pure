'use strict';

const http = require('node:http');

const TRY_LIMITATIONS = 10000;
const TRY_LIMIT = 57;
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
const Client = require('./src/client.js');

const limitRequests = (ip) => {
  const now = Date.now();
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
    return `Too Many Requests. Please try again in ${Math.ceil(
      (remainingTime / MINUTE) % 60,
    )} minutes.`;
  }
  ipRequestCount.push(now);
  if (ipRequestCount.length > TRY_LIMITATIONS) {
    ipRequestCount.shift();
  }

  return false;
};

const parseFormData = (formData) => {
  const parsedData = {};
  const keyValues = formData.split('&');

  for (const keyValuePair of keyValues) {
    const [key, value] = keyValuePair.split('=');
    parsedData[key] = decodeURIComponent(value);
  }

  return parsedData;
};

const receiveArgs = async (req) => {
  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  const resultBuffer = Buffer.concat(buffers);
  const contentType = req.headers['content-type'];
  try {
    const data = resultBuffer.toString();
    if (contentType === 'application/x-www-form-urlencoded') {
      const formData = parseFormData(data);
      return formData;
    }
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
  try {
    http
      .createServer(async (req, res) => {
        const headers = { ...INITIAL_HEADERS };
        const client = await Client.getInstance(req, res);
        const resEnd400 = resEnd(res, 400, headers);

        if (req.method === 'OPTIONS') {
          resEnd(res, 200, headers)();
          return;
        }

        const { url } = req;
        const [ place, name, method ] = url.substring(1).split('/');

        // TODO POSSIBLE OUTDATED IF: External Payment Handler
        if (req.method === 'GET') {
          if (place === 'favicon.ico') {
            resEnd(res, 200, headers)();
            return;
          }
          if (
            place.toLowerCase() === 'api' &&
            name.toLowerCase() === 'external' &&
            method.toLowerCase() === 'ipn'
          ) {
            resEnd(res, 200, headers)();
            return;
          }
        }

        if (req.method !== 'POST') {
          if (req.method === 'GET') {
            if (
              place.toLowerCase() === 'api' &&
              name.toLowerCase() === 'external' &&
              method.toLowerCase() === 'deletion'
            ) {
              // DO NOTHING
            } else {
              resEnd400('"Method not found"');
              return;
            }
          } else {
            resEnd400('"Method not found"');
            return;
          }
        }

        const ip =
          req.headers.remote_addr ||
          req.headers['x-real-ip'] ||
          req.headers['x-forwarded-for'];
        console.log(`${url}, IP ${ip ? ip : '-'};`);

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

        let classicArgs;
        let deletionToken;
        const lowerName = name.toLowerCase();
        const lowerMethod = method.toLowerCase();

        // TODO: POSSIBLE OUTDATED
        if (lowerName === 'external' && lowerMethod === 'ipn') {
          const args = await receiveArgs(req);
          classicArgs = Object.keys(args).length > 0 && args;
        }

        if (lowerName === 'external' && lowerMethod === 'deletion') {
          const [,,, token] = url.substring(1).split('/');
          if (token) deletionToken = token;
        }
        const { args, file } = !classicArgs && (await receiveArgs(req));
        const recordArgs = classicArgs || args || {};
        if (deletionToken) recordArgs.deletionToken = deletionToken;
        // eslint-disable-next-line max-len
        const records = { ...recordArgs, clientId: recordArgs && recordArgs.clientId || client.id };

        if (!handler().access || handler().access !== 'public') {
          if (!client.id && !recordArgs?.clientId) {
            const message = JSON.stringify({ message: 'Unauthorized' });
            resEnd(res, 401, headers)(message);
            return;
          }
        }
        if (
          (name.toLowerCase() === 'user' && method.toLowerCase() === 'find') ||
          (name.toLowerCase() === 'auth' && method.toLowerCase() === 'login')
        ) {
          const message = limitRequests(ip);
          if (message) {
            resEnd(res, 429, headers)(message);
            return;
          }
        }

        if (file) records.file = file;
        const result = await handler().method(records);
        if (result.extraHeaders) {
          Object.assign(headers, result.extraHeaders);
        }
        if (result.error) {
          console.log(result.error);
        }

        if (lowerName === 'external' && lowerMethod === 'deletion')
          res.writeHead(200, { 'Content-Type': 'text/html' });
        else res.writeHead(result.code, headers);

        if (result.buffer) {
          res.end(result.buffer);
          return;
        } else {
          if (lowerName === 'external' && lowerMethod === 'deletion') {
            res.end(result.html);
            return;
          }
          if (lowerName === 'external' && lowerMethod === 'ipn') {
            res.end(result.body);
            return;
          }
          res.end(JSON.stringify(result.body));
          return;
        }
      })
      .listen(port);

    console.log(`Http API on port ${port}`);
  } catch (error) {
    console.log(error);
  }
};
