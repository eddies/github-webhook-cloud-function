const HTTPError = require('../../src/util/httpError');

test('HTTPError', () => {
  const unauthorized = new HTTPError(401, 'Unauthorized');
  expect(unauthorized.message).toEqual('Unauthorized');
  expect(unauthorized.statusCode).toEqual(401);

  const teapot = new HTTPError(418);
  expect(teapot.message).toEqual('I\'m a teapot');
  expect(teapot.statusCode).toEqual(418);
});
