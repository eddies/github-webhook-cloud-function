const github = require('../util/github');
const trello = require('../util/trello');
const HTTPError = require('../util/httpError');

function getShortLink(body, githubEvent) {
  let branch = null;

  /* istanbul ignore else  */
  if (githubEvent === 'push') {
    branch = github.getBranchName(body.ref);
  } else if (githubEvent === 'pull_request') {
    branch = body.pull_request.head.ref;
  } else {
    throw new HTTPError(400, `Unsupported event: ${githubEvent}`);
  }

  if (!branch) {
    throw new HTTPError(400, `Unable to parse branch name for event: ${githubEvent}`);
  } else if (branch.indexOf('/') === 8) { // e.g., a branch like "nqPiDKmw/9-grand-canyon-national-park"
    return branch.substring(0, 8); // The 8 character shortened ID for the card, e.g. "nqPiDKmw"
  } else if (branch === 'master' || branch === 'develop') {
    throw new HTTPError(200, `Ignoring ${githubEvent} event for ${branch} branch`);
  }
  throw new HTTPError(400, `No shortLink found in branch ${branch}`);
}

function getPushMessage(body) {
  if (body && body.repository && body.head_commit) {
    const repo = body.repository.name;
    const pusher = body.pusher.name;
    const commitMessage = body.head_commit.message;
    const commitUrl = body.head_commit.url;
    const commitAuthor = body.head_commit.author.name;
    const shortHash = body.head_commit.id.substring(0, 7);
    const message = `${pusher} pushed [${repo}/${shortHash}](${commitUrl})\n\n${commitMessage}\n\nby *${commitAuthor}*`;
    return message;
  }
  throw new HTTPError(400, `No push message generated for ${body.ref}`);
}

/**
 * Posts a Trello comment or attachment in response to a GitHub Webhook Event.
 *
 * @param {object} req Cloud Function request context.
 * @param {object} res Cloud Function response context.
 */
exports.githubToTrello = async (event, req) => {
  let request = {};
  if (event === 'push') {
    const shortLink = getShortLink(req.body, event);
    const comment = getPushMessage(req.body);
    request = await trello.postComment(shortLink, comment);
  } else if (event === 'pull_request') {
    const { action } = req.body;
    if (action === 'opened') {
      const shortLink = getShortLink(req.body, event);
      const url = req.body.pull_request.html_url;
      request = await trello.postUrlAttachment(shortLink, url);
    } else {
      request.body = `Ignored unsupported pull_request action: ${action}`;
    }
  } else {
    request.body = `Ignored unsupported event: ${event}`;
  }
  return request;
};
