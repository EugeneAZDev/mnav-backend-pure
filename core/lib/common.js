/* eslint-disable max-len */
'use strict';

const crypto = require('node:crypto');
const ExcelJS = require('exceljs');
const fs = require('node:fs');

// Brevo Mailer
const BrevoSDK = require('sib-api-v3-sdk');
const BrevoMailer = BrevoSDK.ApiClient.instance;
BrevoMailer.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
const transactionEmailApi = new BrevoSDK.TransactionalEmailsApi();
const smtpMailData = new BrevoSDK.SendSmtpEmail();
const sender = {
  email: process.env.SOURCE_EMAIL,
  name: process.env.FIRM,
};

const SALT_LEN = 32;
const KEY_LEN = 64;

const SCRYPT_PARAMS = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const SCRYPT_PREFIX = '$scrypt$N=32768,r=8,p=1,maxmem=67108864$';

const userTimeZoneMap = new Map();

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

function encodeBase64URL(str) {
  const base64 = Buffer.from(str).toString('base64');
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

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

const generateToken = (id) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { userId: id };
  const base64Header = encodeBase64URL(JSON.stringify(header));
  const base64Payload = encodeBase64URL(JSON.stringify(payload));
  const hmac = crypto.createHmac('sha256', process.env.SECRET_KEY);
  hmac.update(`${base64Header}.${base64Payload}`);
  const base64Signature = encodeBase64URL(hmac.digest('base64'));

  return `${base64Header}.${base64Payload}.${base64Signature}`;
};

const generateTempToken = () => crypto.randomBytes(16).toString('hex');

const serializeHash = (hash, salt) => {
  const saltString = salt.toString('base64').split('=')[0];
  const hashString = hash.toString('base64').split('=')[0];
  return `${SCRYPT_PREFIX}${saltString}$${hashString}`;
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

const splitObjectIntoArraysByField = (object, value) => object.reduce((acc, rec) => {
  const field = rec[value];
  if (!acc[field]) {
    acc[field] = [];
  }

  const recWithoutValue = {};
  for (const field of Object.keys(rec)) {
    if (field !== value) {
      recWithoutValue[field] = rec[field];
    }
  }

  acc[field].push(recWithoutValue);
  return acc;
}, {});

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

const validNumberValue = (target) =>
  ((typeof target === 'string' || typeof target === 'number') &&
  !isNaN(Number(target)) ?
    Number(target) :
    undefined);

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

const sendEmail = async (email, url) => {
  try {
    smtpMailData.sender = sender;

    smtpMailData.to = [{ email }];
    smtpMailData.subject = 'Password Setup';

    smtpMailData.htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Password Setup</title>
        <style>
          body {
            background-color: #eaeaea;
            font-family: Arial, sans-serif;
          }
          .container {
            width: 70%;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
          }
          h1 {
            text-align: center;
            color: #333333;
          }
          p {
            text-align: center;
            color: #555555;
          }
          .team-name {
            font-size: 12px;
            font-weight: bold;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            transition: background-color 0.3s ease;
          }
          .button:hover {
            background-color: #45a049;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to My Activity Navigator!</h1><br>
          <p>To complete the process, please click the button below:</p>
          <p><a href="${url}" class="button">PASSWORD RESET</a></p>
          <p>We kindly request that you <b>do not reply</b> to this <b>automated email</b></p>.
          <p>If you didn't request any actions from My Activity Navigator product, you can <b>safely ignore</b> the email.</p><br>
          <p class="team-name">© 2023 Golden Tech Development</p>
        </div>
      </body>
    </html>
    `;

    await transactionEmailApi
      .sendTransacEmail(smtpMailData)
      .then((data) => data.messageId)
      .catch((error) => {
        throw new Error(error);
      });
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  ExcelJS,
  fs,
  extractArguments,
  generateTempToken,
  generateToken,
  hashPassword,
  jsonParse,
  receiveBody,
  sendEmail,
  splitObjectIntoArraysByField,
  validatePassword,
  validateToken,
  validNumberValue,
  userTimeZoneMap
};
