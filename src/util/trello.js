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

exports.getBoardId = async (cardId) => {
  const queryParams = querystring.stringify({
    fields: 'id',
    key: apiKey,
    token,
  });

  const options = {
    hostname: 'api.trello.com',
    port: 443,
    path: `/1/cards/${cardId}/board?${queryParams}`,
    method: 'GET',
  };

  const request = await httpsRequest(options);
  return request.id;
};

exports.getCustomFields = async (boardId) => {
  const queryParams = querystring.stringify({
    key: apiKey,
    token,
  });

  const options = {
    hostname: 'api.trello.com',
    port: 443,
    path: `/1/boards/${boardId}/customFields?${queryParams}`,
    method: 'GET',
  };

  return httpsRequest(options);
};

exports.postCustomFields = async (boardId, fields, name = 'PR', type = 'list', pos = 'bottom', display_cardFront = true) => {
  const postData = JSON.stringify({
    idModel: boardId,
    modelType: 'board',
    name,
    type,
    pos,
    options: fields,
    display_cardFront,
    key: apiKey,
    token,
  });

  const options = {
    hostname: 'api.trello.com',
    port: 443,
    path: '/1/customFields',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const request = await httpsRequest(options, postData);
  console.info(`Created custom fields: ${request.id} on https://trello.com/b/${boardId}`);
  return request;
};

exports.putCustomFieldList = async (cardId, idCustomField, idValue) => {
  const putData = querystring.stringify({
    idValue,
    key: apiKey,
    token,
  });

  const options = {
    hostname: 'api.trello.com',
    port: 443,
    path: `/1/card/${cardId}/customField/${idCustomField}/item`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(putData),
    },
  };

  const request = await httpsRequest(options, putData);
  console.info(`Updated custom field: ${request.idCustomField} on https://trello.com/c/${cardId}`);
  return { location: `https://trello.com/c/${cardId}`, body: request };
};
