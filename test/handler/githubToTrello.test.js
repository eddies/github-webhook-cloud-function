const { githubToTrello } = require('../../src/handler/githubToTrello');

jest.mock('../../src/util/httpsRequest');
const { httpsRequest } = require('../../src/util/httpsRequest');

test('push', async () => {
  const req = {
    body: {
      ref: 'refs/heads/nqPiDKmw/9-grand-canyon-national-park',
      repository: { name: 'linguist' },
      pusher: { name: 'josh' },
      head_commit: {
        id: 'd1fd61921892b63b7c142b07e25ce0b153739293',
        message: 'Define Linguist module',
        author: { name: 'josh' },
        url: 'https://github.com/github/linguist/commit/d1fd61921892b63b7c142b07e25ce0b153739293',
      },
    },
  };

  httpsRequest.mockResolvedValue({ id: '560bf4df7139286471dc009e' });
  const request = await githubToTrello('push', req);
  expect(request.body).toEqual({ id: '560bf4df7139286471dc009e' });
  expect(request.location).toEqual('https://trello.com/c/nqPiDKmw/#comment-560bf4df7139286471dc009e');
});

test('unsupported event', async () => {
  const request = await githubToTrello('fooEvent');
  expect(request.body).toEqual('Ignored unsupported event: fooEvent');
});

test('push with invalid body', async () => {
  const req = {
    body: {
      ref: 'refs/heads/nqPiDKmw/9-grand-canyon-national-park',
    },
  };
  await expect(githubToTrello('push', req)).rejects.toThrow(/^No push message generated for refs\/heads\/nqPiDKmw\/9-grand-canyon-national-park$/);
});

test('pull_request', async () => {
  const req = {
    body: {
      action: 'opened',
      pull_request: {
        html_url: 'https://github.com/github/linguist/pull/11',
        head: { ref: 'nqPiDKmw/9-grand-canyon-national-park' },
      },
    },
  };

  httpsRequest.mockResolvedValue({ id: '560bf4df7139286471dc009e' });
  const request = await githubToTrello('pull_request', req);
  expect(request.body).toEqual({ id: '560bf4df7139286471dc009e' });
  expect(request.location).toEqual('https://trello.com/c/nqPiDKmw/#action-560bf4df7139286471dc009e');
});

test('pull_request with invalid branch name', async () => {
  const req = {
    body: {
      action: 'opened',
      pull_request: {
        html_url: 'https://github.com/github/linguist/pull/11',
        head: { ref: 'abcdef/9-grand-canyon-national-park' },
      },
    },
  };

  await expect(githubToTrello('pull_request', req)).rejects.toThrow(/^No shortLink found in branch abcdef\/9-grand-canyon-national-park$/);
});

test('pull_request with unsupported action', async () => {
  const req = {
    body: {
      action: 'labeled',
      pull_request: {
        html_url: 'https://github.com/github/linguist/pull/11',
        head: { ref: 'nqPiDKmw/9-grand-canyon-national-park' },
      },
    },
  };

  const request = await githubToTrello('pull_request', req);
  expect(request.body).toEqual('Ignored unsupported pull_request action: labeled');
});
