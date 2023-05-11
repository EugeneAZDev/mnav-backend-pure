'use strict';

const crypto = require('node:crypto');

const SALT_LEN = 32;
const KEY_LEN = 64;

const SCRYPT_PARAMS = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const SCRYPT_PREFIX = '$scrypt$N=32768,r=8,p=1,maxmem=67108864$';

const serializeHash = (hash, salt) => {
  const saltString = salt.toString('base64').split('=')[0];
  const hashString = hash.toString('base64').split('=')[0];
  return `${SCRYPT_PREFIX}${saltString}$${hashString}`;
};

const parseOptions = (options) => {
  const values = [];
  const items = options.split(',');
  for (const item of items) {
    const [key, val] = item.split('=');
    values.push([key, Number(val)]);
  }
  return Object.fromEntries(values);
};

const deserializeHash = (phcString) => {
  const [, name, options, salt64, hash64] = phcString.split('$');
  if (name !== 'scrypt') {
    throw new Error('Node.js crypto module only supports scrypt');
  }
  const params = parseOptions(options);
  const salt = Buffer.from(salt64, 'base64');
  const hash = Buffer.from(hash64, 'base64');
  return { params, salt, hash };
};

const hashPassword = (password) =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(SALT_LEN, (err, salt) => {
      if (err) {
        reject(err);
        return;
      }
      crypto.scrypt(password, salt, KEY_LEN, SCRYPT_PARAMS, (err, hash) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(serializeHash(hash, salt));
      });
    });
  });

const validatePassword = (password, serHash) => {
  const { params, salt, hash } = deserializeHash(serHash);
  return new Promise((resolve, reject) => {
    const callback = (err, hashedPassword) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(crypto.timingSafeEqual(hashedPassword, hash));
    };
    crypto.scrypt(password, salt, hash.length, params, callback);
  });
};

const jsonParse = (buffer) => {
  if (buffer.length === 0) return null;
  try {
    return JSON.parse(buffer);
  } catch {
    return null;
  }
};

const receiveBody = async (req) => {
  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  return Buffer.concat(buffers).toString();
};

function encodeBase64URL(str) {
  const base64 = Buffer.from(str).toString('base64');
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

const generateToken = (id) => {
  const header = { alg: 'HS256', typ: 'JWT', };
  const payload = { 'userId': id };
  const base64Header = encodeBase64URL(JSON.stringify(header));
  const base64Payload = encodeBase64URL(JSON.stringify(payload));
  const hmac = crypto.createHmac('sha256', process.env.SECRET_KEY);
  hmac.update(`${base64Header}.${base64Payload}`);
  const base64Signature = encodeBase64URL(hmac.digest('base64'));

  return `${base64Header}.${base64Payload}.${base64Signature}`;
};

const validateToken = (token) => {
  const objError = { error: 'Token verification failed' };
  if (!token) return objError;

  const [base64Header, base64Payload, signature] = token.split('.');
  const payload = JSON.parse(
    Buffer.from(base64Payload, 'base64').toString('utf8'),
  );
  const hmac = crypto.createHmac('sha256', process.env.SECRET_KEY);
  hmac.update(`${base64Header}.${base64Payload}`);
  const calculatedSignature = encodeBase64URL(hmac.digest('base64'));
  if (signature === calculatedSignature) {
    return { ...payload };
  } else {
    return objError;
  }
};

const extractArguments = (input) => {
  const match = input.match(/\{([^}]+)\}/);
  if (!match) return [];
  const props = {};
  const propsStr = match[1];
  const propRegex = /(\w+)|\.{3}(\w+)/g;
  let propMatch;
  while ((propMatch = propRegex.exec(propsStr)) !== null) {
    const propName = propMatch[1] || propMatch[2];
    props[propName] = true;
  }
  return Object.keys(props);
};

module.exports = {
  extractArguments,
  generateToken,
  hashPassword,
  jsonParse,
  receiveBody,
  validatePassword,
  validateToken,
};
