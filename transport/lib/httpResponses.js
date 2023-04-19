'use strict';

const created = () => ({
  code: 201,
  body: { message: 'Created' },
});

const error = () => ({
  code: 500,
  body: { message: 'Internal Server Error' },
});

const notFound = () => ({
  code: 404,
  body: { message: 'Not Found' },
});

const success = () => ({
  code: 200,
  body: { message: 'Success' },
});

const unauthorized = () => ({
  code: 401,
  body: { message: 'Incorrect Login or Password' },
});

const updated = () => ({
  code: 200,
  body: { message: 'Updated' },
});


module.exports = {
  created,
  error,
  notFound,
  success,
  unauthorized,
  updated
};
