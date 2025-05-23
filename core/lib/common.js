/* eslint-disable max-len */
'use strict';

const { Buffer } = require('node:buffer');
const ExcelJS = require('exceljs');
const { OAuth2Client } = require('google-auth-library');
const cron = require('node-cron');
const crypto = require('node:crypto');
const fs = require('node:fs');
const { fetch } = require('undici');
const path = require('node:path');

// OAuth2Client
const oAuth2Client = new OAuth2Client(process.env.REACT_APP_MNAVGAUTH_PUBLIC_KEY);

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

// Payment Config
const PAYMENT_CONFIG = {
  sellerId: process.env.PAYMENT_SELLER_ID,
  secretKey: process.env.PAYMENT_SECRET_KEY,
  jwtExpireTime: 20, // minutes
};

const SALT_LEN = 32;
const KEY_LEN = 64;

const SCRYPT_PARAMS = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const SCRYPT_PREFIX = '$scrypt$N=32768,r=8,p=1,maxmem=67108864$';

const userTimeZoneMap = new Map();
const userStatusMap = new Map();

const packageJson = fs.readFileSync('package.json', 'utf8');
const { version } = JSON.parse(packageJson);
const API_VERSION = version;

const byteLength = (str) => {
  let s = str.length;
  for (let i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) s++;
    else if (code > 0x7ff && code <= 0xffff) s += 2;
    if (code >= 0xdc00 && code <= 0xdfff) i--;
  }
  return s;
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

const serializeHashArray = (obj) => {
  let retValue = '';
  for (const [key, value] of Object.entries(obj)) {
    if (['HASH', 'SIGNATURE_SHA2_256', 'SIGNATURE_SHA3_256'].includes(key)) {
      continue;
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
      retValue += serializeHashArray(value);
    } else {
      const stringValue = String(value);
      const length = Buffer.byteLength(stringValue, 'utf-8');
      retValue += length + stringValue;
    }
  }
  return retValue;
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

const getDaysByDates = (from, to) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);

  const diffTime = toDate - fromDate;
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.floor(diffTime / millisecondsPerDay);
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

const generateMD5Token = (secret, data) => {
  const hmac = crypto.createHmac('md5', secret);
  hmac.update(data);
  return hmac.digest('hex');
};

const generateSHA256Token = (secret, data) => {
  const hmac = crypto.createHmac('sha256', secret).update(data);
  return hmac.digest('hex');
};

const generateSHA3256Token = (secret, data) => {
  const hmac = crypto.createHmac('sha3-256', secret).update(data);
  return hmac.digest('hex');
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

const removeEmptyValues = (obj) => {
  const modifiedObj = { ...obj };
  for (const key in obj) {
    if (
      modifiedObj[key] === '' ||
      modifiedObj[key] === undefined ||
      modifiedObj[key] === null ||
      modifiedObj[key] === '0' ||
      modifiedObj[key] === '0.00' ||
      modifiedObj[key] === '-'
    ) {
      delete modifiedObj[key];
    }
  }

  return modifiedObj;
};

const splitObjectIntoArraysByField = (object, value) =>
  object.reduce((acc, rec) => {
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

const transformToPureDate = (values) =>
  values.map((item) => {
    const date = new Date(item.createdAt);
    const formattedDate = date.toISOString().split('T')[0];
    return { ...item, createdAt: formattedDate };
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

const getEmailContent = (contentPath, locale, type) => {
  const titleMap = new Map([
    ['en-code', 'Registration Code'],
    ['ru-code', 'Код для регистрации'],
    ['uk-code', 'Код для реєстрації'],
    ['en-reset', 'Reset password'],
    ['ru-reset', 'Сброс пароля'],
    ['uk-reset', 'Скидання пароля'],
    ['en-premium', 'Welcome to My Activity Navigator PREMIUM!'],
    ['ru-premium', 'My Activity Navigator PREMIUM уже доступен!'],
    ['uk-premium', 'My Activity Navigator PREMIUM вже доступний!'],
    ['en-delete', 'Deletion process'],
    ['ru-delete', 'Процесс удаления'],
    ['uk-delete', 'Процес видалення'],
    ['en-deleted', 'Deletion completed'],
    ['ru-deleted', 'Удаление завершено'],
    ['uk-deleted', 'Видалення завершене'],
  ]);
  const filePath = path.join(
    contentPath,
    `./resources/emails/${locale}/${type}.html`,
  );
  const content = fs.readFileSync(filePath, 'utf8');
  const subject =
    titleMap.get(`${locale}-${type}`) || titleMap.get(`en-${type}`);
  return { subject, content };
};

const sendEmail = async (email, subject, content, buffer) => {
  try {
    smtpMailData.sender = sender;
    smtpMailData.to = [{ email }];
    smtpMailData.subject = subject;
    smtpMailData.htmlContent = content;
    if (buffer) {
      smtpMailData.attachment = [{
        name: 'MyActivity.xlsx',
        content: buffer.toString('base64'),
      }];
    }
    await transactionEmailApi
      .sendTransacEmail(smtpMailData)
      .then((data) => data.messageId)
      .catch((error) => {
        throw new Error(error);
      });
  } catch (error) {
    console.error('Email sending', error);
    throw new Error(error);
  }
};

const getHtmlContent = (contentPath, locale, type, params) => {
  const filePath = path.join(contentPath, `./resources/html/${locale}/${type}.html`);
  const originContent = fs.readFileSync(filePath, 'utf8');
  if (type === 'delete') {
    const { details, values, items, sections } = params;
    const modifiedDetailsContent = originContent.replace('${details}', details);
    const modifiedValuesContent = modifiedDetailsContent.replace('${values}', values);
    const modifiedItemsContent = modifiedValuesContent.replace('${items}', items);
    const modifiedSectionsContent = modifiedItemsContent.replace('${sections}', sections);
    return modifiedSectionsContent;
  } else {
    return originContent;
  }
};

const readJsonFromFile = async (filePath) => {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    return jsonData;
  } catch (err) {
    console.error(`Error reading JSON from file: ${err.message}`);
    throw err;
  }
};

/**
 * Calculating stats: average, maximum and minimum for the following periods: days, weeks, months, years
 */
const getISOWeekNumber = (date) => {
  const tempDate = new Date(date.getTime());
  const dayNum = (tempDate.getDay() + 6) % 7;
  tempDate.setDate(tempDate.getDate() - dayNum + 3);
  const firstThursday = new Date(tempDate.getFullYear(), 0, 4);
  const diff = tempDate - firstThursday;
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
};
const getISOWeekYear = (date) => {
  const tempDate = new Date(date.getTime());
  const dayNum = (tempDate.getDay() + 6) % 7;
  tempDate.setDate(tempDate.getDate() - dayNum + 3);
  return tempDate.getFullYear();
};
const aggregateDataToArrays = (data) => {
  const groups = {
    days: {},
    weeks: {},
    months: {},
    years: {},
  };

  for (const item of data) {
    const value = Number(item.value);
    const date = new Date(item.createdAt);

    const dayKey = date.toISOString().slice(0, 10);
    groups.days[dayKey] = (groups.days[dayKey] || 0) + value;

    const weekYear = getISOWeekYear(date);
    const weekNumber = getISOWeekNumber(date);
    const weekKey = `${weekYear}-W${weekNumber}`;
    groups.weeks[weekKey] = (groups.weeks[weekKey] || 0) + value;

    const monthKey = date.toISOString().slice(0, 7);
    groups.months[monthKey] = (groups.months[monthKey] || 0) + value;

    const yearKey = date.getFullYear().toString();
    groups.years[yearKey] = (groups.years[yearKey] || 0) + value;
  }

  const sortedValues = (obj) =>
    Object.keys(obj)
      .sort()
      .map((key) => obj[key]);

  return {
    days: sortedValues(groups.days),
    weeks: sortedValues(groups.weeks),
    months: sortedValues(groups.months),
    years: sortedValues(groups.years),
  };
};
const getStats = (array) => {
  if (!Array.isArray(array) || array.length === 0) {
    return { min: null, max: null, avg: null };
  }

  let min = array[0];
  let max = array[0];
  let sum = 0;

  for (const num of array) {
    if (num < min) min = num;
    if (num > max) max = num;
    sum += num;
  }

  return {
    min: Math.round(min),
    max: Math.round(max),
    avg: Math.round(sum / array.length),
  };
};
const getProgressPercentage = (current, prev) => parseInt((current * 100) / prev - 100, 10);
const getAvgMaxMinStats = (data) => {
  const { days, weeks, months, years } = aggregateDataToArrays(data);

  const dayStats = getStats(days);
  const weekStats = getStats(weeks);
  const monthStats = getStats(months);
  const yearStats = getStats(years);

  const dayPercentageDynamics = getProgressPercentage(days[days.length - 1], days[days.length - 2]);
  const weekPercentageDynamics = getProgressPercentage(weeks[weeks.length - 1], weeks[weeks.length - 2]);
  const monthPercentageDynamics = getProgressPercentage(months[months.length - 1], months[months.length - 2]);
  const yearPercentageDynamics = getProgressPercentage(years[years.length - 1], years[years.length - 2]);

  return {
    days: dayStats,
    weeks: weekStats,
    months: monthStats,
    years: yearStats,
    dayPercentageDynamics,
    weekPercentageDynamics,
    monthPercentageDynamics,
    yearPercentageDynamics
  };
};
/* Calculating stats: End section */

module.exports = {
  API_VERSION,
  Buffer,
  byteLength,
  cron,
  ExcelJS,
  fetch,
  fs,
  extractArguments,
  getAvgMaxMinStats,
  getDaysByDates,
  getEmailContent,
  getHtmlContent,
  generateTempToken,
  generateToken,
  generateMD5Token,
  generateSHA256Token,
  generateSHA3256Token,
  hashPassword,
  jsonParse,
  PAYMENT_CONFIG,
  readJsonFromFile,
  receiveBody,
  removeEmptyValues,
  sendEmail,
  serializeHashArray,
  splitObjectIntoArraysByField,
  transformToPureDate,
  validatePassword,
  validateToken,
  validNumberValue,
  userStatusMap,
  userTimeZoneMap,
  URLSearchParams,
  oAuth2Client,
};
