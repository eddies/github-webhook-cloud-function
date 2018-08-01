const assert = require('assert');
const crypto = require('crypto');

/**
 * Generate a signature for the provided payload.
 *
 * The secret must be available as an environment variable, GITHUB_SECRET.
 * Returns a string such as 'sha1=5d6466b80ce43f67026d652ad53cf3a68a4fafe6'.
 *
 * @param {String|Buffer} payload The payload to sign.
 */
exports.sign = (payload) => {
  const secret = process.env.GITHUB_SECRET;
  assert(secret, 'No secret');
  return `sha1=${crypto.createHmac('sha1', secret).update(payload).digest('hex')}`;
};

function verify(signature, body) {
  const payload = JSON.stringify(body);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(exports.sign(payload)));
}

/**
 * Verify that the webhook request came from GitHub.
 *
 * @param {object} headers The headers of the request.
 * @param {object} body The body of the request.
 */
exports.validateWebhook = ({ headers = null, body = null } = {}) => {
  assert(headers, 'Must provide headers');
  assert(body, 'Must provide body');
  assert(headers['x-hub-signature'], 'Must provide X-Hub-Signature header');
  assert(headers['x-github-event'], 'Must provide X-GitHub-Event header');
  assert(headers['x-github-delivery'], 'Must provide X-GitHub-Delivery header');
  assert(verify(headers['x-hub-signature'], body), 'X-Hub-Signature mis-match');
  return true;
};

/**
 * Get the branch name from the Git ref
 * Given a ref like "refs/head/branch-name", returns "branch-name", else null.
 *
 * @param {string} ref The full Git ref that was pushed, e.g. "refs/heads/master"
 */
exports.getBranchName = (ref) => {
  const regex = /refs\/heads\/(.+)/;
  const found = ref && ref.match(regex);
  if (found) {
    return found[1];
  }
  return null;
};
