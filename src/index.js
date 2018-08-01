const github = require('./util/github');
const HTTPError = require('./util/httpError');
const { githubToTrello: handler } = require('./handler/githubToTrello');

/**
 * HTTP Cloud Function for GitHub Webhook events.
 *
 * @param {object} req Cloud Function request context.
 * @param {object} res Cloud Function response context.
 */
exports.githubWebhookHandler = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      throw new HTTPError(405, 'Only POST requests are accepted');
    }

    // Verify that this request came from GitHub
    github.validateWebhook(req);

    const githubEvent = req.headers['x-github-event'];
    const request = await handler(githubEvent, req);

    // The location is the URI of the newly created resource
    const { location } = request;
    if (location) {
      res.setHeader('Location', location);
      res.status(201);
    } else {
      res.status(200);
    }
    res.send(request.body);
  } catch (e) {
    if (e instanceof HTTPError) {
      res.status(e.statusCode).send(e.message);
    } else {
      res.status(500).send(e.message);
    }
  }
};
