const { httpsRequest } = require('../../src/util/httpsRequest');

jest.mock('../../src/util/httpsRequest');

test('httpsRequest', async () => {
  httpsRequest.mockResolvedValue({ bar: 'baz' });
  expect(await httpsRequest()).toEqual({ bar: 'baz' });
});
