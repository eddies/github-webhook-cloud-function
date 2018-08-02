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
    if (!req || !res || !req.method) {
      throw new HTTPError(400);
    }

    if (req.method !== 'POST') {
      console.info(`Rejected ${req.method} request from ${req.ip} (${req.headers['user-agent']})`);
      throw new HTTPError(405, 'Only POST requests are accepted');
    }
    console.info(`Received request from ${req.ip} (${req.headers['user-agent']})`);

    // Verify that this request came from GitHub
    github.validateWebhook(req);

    const githubEvent = req.headers['x-github-event'];
    const request = await handler(githubEvent, req);

    // The location is the URI of the newly created resource
    const { location } = request;
    if (location) {
      res.setHeader('Location', location);
      res.status(201);
      console.info(`HTTP 201: Created ${location} for ${githubEvent} event`);
    } else {
      res.status(200);
      console.info(`HTTP 200: ${githubEvent} event`);
    }
    res.send(request.body);
  } catch (e) {
    if (e instanceof HTTPError) {
      res.status(e.statusCode).send(e.message);
      console.info(`HTTP ${e.statusCode}: ${e.message}`);
    } else {
      res.status(500).send(e.message);
      console.error(`HTTP 500: ${e.message}`);
    }
  }
};
