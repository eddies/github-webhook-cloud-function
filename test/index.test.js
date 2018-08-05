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
  const req = {
    method: 'GET',
    ip: '127.0.0.1',
    headers: {
      'user-agent': 'GitHub-Hookshot/1234ab1',
    },
  };
  await githubWebhookHandler(req, mockRes);
  expect(mockRes.statusCode).toBe(405);
  expect(mockRes.message).toBe('Only POST requests are accepted');
});

test('githubWebhookHandler with missing req', async () => {
  await githubWebhookHandler(null, mockRes);
  expect(mockRes.statusCode).toBe(400);
  expect(mockRes.message).toBe('Bad Request');
});

test('githubWebhookHandler missing GITHUB_SECRET', async () => {
  const req = {
    method: 'POST',
    ip: '127.0.0.1',
    headers: {
      'user-agent': 'GitHub-Hookshot/1234ab2',
      'x-hub-signature': 'sha1=3893bc155724732fc4fdd78d8d666f8be160d11b',
      'x-github-event': 'pull_request',
      'x-github-delivery': 'y',
    },
    body: {
      action: 'opened',
    },
  };
  await githubWebhookHandler(req, mockRes);
  expect(mockRes.statusCode).toBe(500);
  expect(mockRes.message).toBe('No secret');
});

test('githubWebhookHandler POST pull_request', async () => {
  process.env.GITHUB_SECRET = 'This should be a high entropy random string';
  const req = {
    method: 'POST',
    ip: '127.0.0.1',
    headers: {
      'user-agent': 'GitHub-Hookshot/1234ab3',
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

  httpsRequest.mockResolvedValue({ id: '560bf4df7139286471dc009e' });
  await githubWebhookHandler(req, mockRes);
  expect(mockRes.message).toEqual({ id: '560bf4df7139286471dc009e' });
  expect(mockRes.statusCode).toBe(201);
});

test('githubWebhookHandler POST pull_request with unsupported action', async () => {
  process.env.GITHUB_SECRET = 'This should be a high entropy random string';
  const req = {
    method: 'POST',
    ip: '127.0.0.1',
    headers: {
      'user-agent': 'GitHub-Hookshot/1234ab4',
      'x-hub-signature': 'sha1=d41223707fe8e9f1cd561690a88bb4458873b14c',
      'x-github-event': 'pull_request',
      'x-github-delivery': 'y',
    },
    body: {
      action: 'labeled',
    },
  };

  httpsRequest.mockResolvedValue({ foo: 'bar' });
  await githubWebhookHandler(req, mockRes);
  expect(mockRes.statusCode).toBe(200);
  expect(mockRes.message).toBe('Ignored unsupported pull_request action: labeled');
});

test('githubWebhookHandler POST pull_request with invalid signatures', async () => {
  process.env.GITHUB_SECRET = 'This should be a high entropy random string';
  httpsRequest.mockResolvedValue({ foo: 'bar' });

  const req = {
    method: 'POST',
    ip: '127.0.0.1',
    headers: {
      'user-agent': 'GitHub-Hookshot/1234ab5',
      'x-github-event': 'pull_request',
      'x-github-delivery': 'y',
    },
    body: {
      action: 'labeled',
    },
  };

  req.headers['x-hub-signature'] = 'x'.repeat(45);
  await githubWebhookHandler(req, mockRes);
  expect(mockRes.statusCode).toBe(403);
  expect(mockRes.message).toBe('X-Hub-Signature mis-match');

  req.headers['x-hub-signature'] = 'foo';
  await githubWebhookHandler(req, mockRes);
  expect(mockRes.statusCode).toBe(403);
  expect(mockRes.message).toBe('X-Hub-Signature mis-match');
});
