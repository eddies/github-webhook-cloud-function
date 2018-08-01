const querystring = require('querystring');
const { httpsRequest } = require('./httpsRequest');

const apiKey = process.env.TRELLO_API_KEY;
const token = process.env.TRELLO_TOKEN;

/**
 * Posts a comment to a Trello card.
 *
 * @param {string} cardId The Trello cardId (aka shortLink)
 * @param {string} comment The comment string to post
 */
exports.postComment = async (cardId, comment) => {
  const postData = querystring.stringify({
    text: comment,
    key: apiKey,
    token,
  });

  const options = {
    hostname: 'api.trello.com',
    port: 443,
    path: `/1/cards/${cardId}/actions/comments`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
    },
  };
  const request = await httpsRequest(options, postData);
  return { location: `https://trello.com/c/${cardId}/#comment-${request.id}`, body: request };
};

/**
 * Posts a URL attachment to a Trello card.
 *
 * @param {string} cardId The Trello cardId (aka shortLink)
 * @param {string} url The URL to add as an attachment to the card
 */
exports.postUrlAttachment = async (cardId, url) => {
  const postData = querystring.stringify({
    url,
    key: apiKey,
    token,
  });

  const options = {
    hostname: 'api.trello.com',
    port: 443,
    path: `/1/cards/${cardId}/attachments`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const request = await httpsRequest(options, postData);
  return { location: `https://trello.com/c/${cardId}/#action-${request.id}`, body: request };
};
