const { promisify } = require('util');
const https = require('https');
const HTTPError = require('./httpError');

https.request[promisify.custom] = (options, postData) => new Promise((resolve, reject) => {
  const req = https.request(options, (response) => {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      return reject(new HTTPError(response.statusCode));
    }

    let body = [];
    response.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      try {
        body = Buffer.concat(body);
        if (response.headers['content-type'].includes('application/json')) {
          body = JSON.parse(body);
        } else {
          body = body.toString();
        }
      } catch (e) {
        reject(e);
      }
      resolve(body);
    });
    return null;
  });

  req.on('error', (err) => {
    reject(err);
  });
  if (postData) {
    req.write(postData);
  }
  req.end();
});

exports.httpsRequest = promisify(https.request);
