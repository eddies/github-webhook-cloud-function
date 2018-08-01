const { postComment, postUrlAttachment } = require('../../src/util/trello');

jest.mock('../../src/util/httpsRequest');
const { httpsRequest } = require('../../src/util/httpsRequest');

test('postComment', async () => {
  httpsRequest.mockResolvedValue({ id: '560bf4df7139286471dc009e' });
  const request = await postComment('nqPiDKmw', 'Hello, world!');
  expect(request.body).toEqual({ id: '560bf4df7139286471dc009e' });
  expect(request.location).toEqual('https://trello.com/c/nqPiDKmw/#comment-560bf4df7139286471dc009e');
});

test('postUrlAttachment', async () => {
  httpsRequest.mockResolvedValue({ id: '560bf4df7139286471dc009e' });
  const request = await postUrlAttachment('nqPiDKmw', 'https://github.com/github/linguist/pull/11');
  expect(request.body).toEqual({ id: '560bf4df7139286471dc009e' });
  expect(request.location).toEqual('https://trello.com/c/nqPiDKmw/#action-560bf4df7139286471dc009e');
});
