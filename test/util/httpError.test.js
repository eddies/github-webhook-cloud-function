const HTTPError = require('../../src/util/httpError');

test('HTTPError', () => {
  const unauthorized = new HTTPError(401, 'Unauthorized');
  expect(unauthorized.message).toEqual('Unauthorized');
  expect(unauthorized.statusCode).toEqual(401);

  const teapot = new HTTPError(418);
  expect(teapot.message.toLowerCase()).toEqual('I\'m a teapot'.toLowerCase()); // in Node 10, 'teapot' became 'Teapot'
  expect(teapot.statusCode).toEqual(418);
});
