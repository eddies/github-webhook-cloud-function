const { getBranchName, validateWebhook } = require('../../src/util/github');

beforeEach(() => {
  jest.resetModules();
  delete process.env.GITHUB_SECRET;
});

test('getBranchName', () => {
  expect(getBranchName(null)).toBeNull();
  expect(getBranchName(undefined)).toBeNull();
  expect(getBranchName('')).toBeNull();
  expect(getBranchName('refs/heads/master')).toBe('master');
  expect(getBranchName('refs/heads/branch/name/with/slashies')).toBe('branch/name/with/slashies');
});

test('validateWebhook with missing parameters', () => {
  expect(() => validateWebhook()).toThrowError(/^Bad Request$/);
  expect(() => validateWebhook({ headers: null, body: null })).toThrowError(/^Bad Request$/);
  expect(() => validateWebhook({ headers: {} })).toThrowError(/^Bad Request$/);
  expect(() => validateWebhook({
    headers: {},
    body: {},
  })).toThrowError(/^Must provide X-Hub-Signature header$/);
  expect(() => validateWebhook({
    headers: { 'x-hub-signature': 'x' },
    body: {},
  })).toThrowError(/^Must provide X-GitHub-Event header$/);
  expect(() => validateWebhook({
    headers: { 'x-hub-signature': 'x', 'x-github-event': 'y' },
    body: {},
  })).toThrowError(/^Must provide X-GitHub-Delivery header$/);
});

test('validateWebhook signature verification', () => {
  delete process.env.GITHUB_SECRET;
  expect(() => validateWebhook({
    headers: { 'x-hub-signature': 'x', 'x-github-event': 'y', 'x-github-delivery': 'z' },
    body: {},
  })).toThrowError(/^No secret$/);

  process.env.GITHUB_SECRET = 'This should be a high entropy random string';
  expect(() => validateWebhook({
    headers: {
      'x-hub-signature': `sha1=${'1'.repeat(40)}`,
      'x-github-event': 'y',
      'x-github-delivery': 'z',
    },
    body: { foo: 'bar' },
  })).toThrowError(/^X-Hub-Signature mis-match$/);

  expect(validateWebhook({
    headers: {
      'x-hub-signature': 'sha1=5d6466b80ce43f67026d652ad53cf3a68a4fafe6',
      'x-github-event': 'y',
      'x-github-delivery': 'z',
    },
    body: { foo: 'bar' },
  })).toBe(true);
});
