const { githubWebhookHandler } = require('../src');

jest.mock('../src/util/httpsRequest');
const { httpsRequest } = require('../src/util/httpsRequest');

const mockRes = {
  send(message) {
    this.message = message;
    return this;
  },
  setHeader(h) {
    this.location = h;
    return this;
  },
  status(s) {
    this.statusCode = s;
    return this;
  },
};

beforeEach(() => {
  jest.resetModules();
  delete process.env.GITHUB_SECRET;
});

test('githubWebhookHandler GET', async () => {
  await githubWebhookHandler({ method: 'GET' }, mockRes);
  expect(mockRes.statusCode).toBe(405);
  expect(mockRes.message).toBe('Only POST requests are accepted');
});

test('githubWebhookHandler with missing req', async () => {
  await githubWebhookHandler(null, mockRes);
  expect(mockRes.statusCode).toBe(500);
  expect(mockRes.message).toBe('Cannot read property \'method\' of null');
});

test('githubWebhookHandler POST pull_request', async () => {
  process.env.GITHUB_SECRET = 'This should be a high entropy random string';
  const req = {
    method: 'POST',
    headers: {
      'x-hub-signature': 'sha1=3893bc155724732fc4fdd78d8d666f8be160d11b',
      'x-github-event': 'pull_request',
      'x-github-delivery': 'y',
    },
    body: {
      action: 'opened',
      pull_request: {
        html_url: 'https://github.com/github/linguist/pull/11',
        head: { ref: 'nqPiDKmw/9-grand-canyon-national-park' },
      },
    },
  };

  httpsRequest.mockResolvedValue({ foo: 'bar' });
  await githubWebhookHandler(req, mockRes);
  expect(mockRes.message).toEqual({ foo: 'bar' });
  expect(mockRes.statusCode).toBe(201);
});

test('githubWebhookHandler POST pull_request with unsupported action', async () => {
  process.env.GITHUB_SECRET = 'This should be a high entropy random string';
  const req = {
    method: 'POST',
    headers: {
      'x-hub-signature': 'sha1=4f0b2c5226f6fdb85707fc54f60bb1600b4a632e',
      'x-github-event': 'pull_request',
      'x-github-delivery': 'y',
    },
    body: {
      action: 'labeled',
      pull_request: {
        html_url: 'https://github.com/github/linguist/pull/11',
        head: { ref: 'nqPiDKmw/9-grand-canyon-national-park' },
      },
    },
  };

  httpsRequest.mockResolvedValue({ foo: 'bar' });
  await githubWebhookHandler(req, mockRes);
  expect(mockRes.statusCode).toBe(200);
  expect(mockRes.message).toBe('Ignored unsupported pull_request action: labeled');
});
