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
    const forced = body.forced ? 'force pushed' : 'pushed';
    const pusher = body.pusher.name;
    const commitMessage = body.head_commit.message;
    const commitUrl = body.head_commit.url;
    const commitAuthor = body.head_commit.author.name;
    const shortHash = body.head_commit.id.substring(0, 7);
    const message = `${pusher} ${forced} [${repo}/${shortHash}](${commitUrl})\n\n${commitMessage}\n\nby *${commitAuthor}*`;
    return message;
  }
  throw new HTTPError(400, `No push message generated for ${body.ref}`);
}

async function updatePrStatus(body, status) {
  const shortLink = getShortLink(body, 'pull_request');

  if (status === 'Open') {
    const url = body.pull_request.html_url;
    const attachmentUrl = await trello.postUrlAttachment(shortLink, url);
    console.info('Created PR attachment: ', attachmentUrl.location);
  }

  const boardId = await trello.getBoardId(shortLink);
  const customFields = await trello.getCustomFields(boardId);
  let prFields = customFields.filter(el => el.name === 'PR')[0];
  if (!prFields) {
    // create board-level PR custom fields
    try {
      prFields = await trello.postCustomFields(boardId, [
        {
          color: 'green',
          value: {
            text: 'Open',
          },
          pos: 1024,
        },
        {
          color: 'red',
          value: {
            text: 'Closed',
          },
          pos: 2048,
        },
        {
          color: 'purple',
          value: {
            text: 'Merged',
          },
          pos: 4096,
        },
      ]);
    } catch (err) {
      if (err instanceof HTTPError && err.statusCode === 403) {
        err.message = `Custom Fields Power-Up not enabled for board ${boardId}`;
      }
      throw err;
    }
  }

  const statusOption = prFields.options.filter(el => el.value.text === status)[0];
  if (!statusOption) {
    throw new HTTPError(500, `Custom Fields for PR missing status ${status}`);
  }
  return trello.putCustomFieldList(shortLink, statusOption.idCustomField, statusOption.id);
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
    const merged = req.body.pull_request ? req.body.pull_request.merged : false;
    if (action === 'opened') {
      // set PR status to open
      request = await updatePrStatus(req.body, 'Open');
    } else if (action === 'closed' && merged) {
      // set PR status to merged
      request = await updatePrStatus(req.body, 'Merged');
    } else if (action === 'closed' && !merged) {
      // set PR status to closed
      request = await updatePrStatus(req.body, 'Closed');
    } else {
      request.body = `Ignored unsupported pull_request action: ${action}`;
    }
  } else {
    request.body = `Ignored unsupported event: ${event}`;
  }
  return request;
};
