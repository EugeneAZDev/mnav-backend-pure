'use strict';

const created = () => ({
  code: 201,
  body: 'Created',
});

const error = () => ({
  code: 500,
  body: 'Internal Server Error',
});

const notFound = () => ({
  code: 404,
  body: 'Not Found',
});

const success = () => ({
  code: 200,
  body: 'Success',
});

const unauthorized = () => ({
  code: 401,
  body: 'Incorrect Login or Password',
});

const updated = () => ({
  code: 200,
  body: 'Updated',
});

const deleted = () => ({
  code: 200,
  body: 'Updated',
});


module.exports = {
  created,
  deleted,
  error,
  notFound,
  success,
  unauthorized,
  updated
};
