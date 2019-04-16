const { githubToTrello } = require('../../src/handler/githubToTrello');
const trello = require('../../src/util/trello');
const HTTPError = require('../../src/util/httpError');

jest.mock('../../src/util/httpsRequest');
const { httpsRequest } = require('../../src/util/httpsRequest');

// trello.postComment = jest.fn();

test('push with shortLink at end', async () => {
  const req = {
    body: {
      ref: 'refs/heads/9-grand-canyon-national-park#nqPiDKmw',
      repository: { name: 'linguist' },
      pusher: { name: 'josh' },
      head_commit: {
        id: 'd1fd61921892b63b7c142b07e25ce0b153739293',
        message: 'Define Linguist module',
        author: { name: 'josh' },
        url: 'https://github.com/github/linguist/commit/d1fd61921892b63b7c142b07e25ce0b153739293',
      },
    },
  };

  const trelloSpy = jest.spyOn(trello, 'postComment');
  httpsRequest.mockResolvedValue({ id: '560bf4df7139286471dc009e' });
  const request = await githubToTrello('push', req);
  expect(trelloSpy).toHaveBeenCalledWith('nqPiDKmw', expect.stringMatching(/^josh pushed \[linguist/));
  expect(request.body).toEqual({ id: '560bf4df7139286471dc009e' });
  expect(request.location).toEqual('https://trello.com/c/nqPiDKmw/#comment-560bf4df7139286471dc009e');
});

test('push with shortLink at beginning', async () => {
  const req = {
    body: {
      ref: 'refs/heads/nqPiDKmw/9-grand-canyon-national-park',
      repository: { name: 'linguist' },
      pusher: { name: 'josh' },
      head_commit: {
        id: 'd1fd61921892b63b7c142b07e25ce0b153739293',
        message: 'Define Linguist module',
        author: { name: 'josh' },
        url: 'https://github.com/github/linguist/commit/d1fd61921892b63b7c142b07e25ce0b153739293',
      },
    },
  };

  const trelloSpy = jest.spyOn(trello, 'postComment');
  httpsRequest.mockResolvedValue({ id: '560bf4df7139286471dc009e' });
  const request = await githubToTrello('push', req);
  expect(trelloSpy).toHaveBeenCalledWith('nqPiDKmw', expect.stringMatching(/^josh pushed \[linguist/));
  expect(request.body).toEqual({ id: '560bf4df7139286471dc009e' });
  expect(request.location).toEqual('https://trello.com/c/nqPiDKmw/#comment-560bf4df7139286471dc009e');
});

test('force push with shortLink at end', async () => {
  const req = {
    body: {
      ref: 'refs/heads/9-grand-canyon-national-park#nqPiDKmw',
      forced: true,
      repository: { name: 'linguist' },
      pusher: { name: 'josh' },
      head_commit: {
        id: 'd1fd61921892b63b7c142b07e25ce0b153739293',
        message: 'Define Linguist module',
        author: { name: 'josh' },
        url: 'https://github.com/github/linguist/commit/d1fd61921892b63b7c142b07e25ce0b153739293',
      },
    },
  };

  const trelloSpy = jest.spyOn(trello, 'postComment');
  httpsRequest.mockResolvedValue({ id: '560bf4df7139286471dc009e' });
  const request = await githubToTrello('push', req);
  expect(trelloSpy).toHaveBeenCalledWith('nqPiDKmw', expect.stringMatching(/^josh force pushed \[linguist/));
  expect(request.body).toEqual({ id: '560bf4df7139286471dc009e' });
  expect(request.location).toEqual('https://trello.com/c/nqPiDKmw/#comment-560bf4df7139286471dc009e');
});

test('force push with shortLink at beginning', async () => {
  const req = {
    body: {
      ref: 'refs/heads/nqPiDKmw/9-grand-canyon-national-park',
      forced: true,
      repository: { name: 'linguist' },
      pusher: { name: 'josh' },
      head_commit: {
        id: 'd1fd61921892b63b7c142b07e25ce0b153739293',
        message: 'Define Linguist module',
        author: { name: 'josh' },
        url: 'https://github.com/github/linguist/commit/d1fd61921892b63b7c142b07e25ce0b153739293',
      },
    },
  };

  const trelloSpy = jest.spyOn(trello, 'postComment');
  httpsRequest.mockResolvedValue({ id: '560bf4df7139286471dc009e' });
  const request = await githubToTrello('push', req);
  expect(trelloSpy).toHaveBeenCalledWith('nqPiDKmw', expect.stringMatching(/^josh force pushed \[linguist/));
  expect(request.body).toEqual({ id: '560bf4df7139286471dc009e' });
  expect(request.location).toEqual('https://trello.com/c/nqPiDKmw/#comment-560bf4df7139286471dc009e');
});

test('unsupported event', async () => {
  const request = await githubToTrello('fooEvent');
  expect(request.body).toEqual('Ignored unsupported event: fooEvent');
});

test('push with invalid body', async () => {
  let req;
  req = {
    body: {
      ref: 'refs/heads/9-grand-canyon-national-park#nqPiDKmw',
    },
  };
  await expect(githubToTrello('push', req)).rejects.toThrow(/^No push message generated for refs\/heads\/9-grand-canyon-national-park#nqPiDKmw$/);

  req = {
    body: {
      ref: 'refs/heads/nqPiDKmw/9-grand-canyon-national-park',
    },
  };
  await expect(githubToTrello('push', req)).rejects.toThrow(/^No push message generated for refs\/heads\/nqPiDKmw\/9-grand-canyon-national-park$/);
});

test('push with invalid ref', async () => {
  const req = {
    body: {
      ref: 'refs/asdf',
    },
  };
  await expect(githubToTrello('push', req)).rejects.toThrow(/^Unable to parse branch name for event: push$/);
});

test('push on master', async () => {
  const req = {
    body: {
      ref: 'refs/heads/master',
    },
  };
  await expect(githubToTrello('push', req)).rejects.toThrow(/^Ignoring push event for master branch$/);
});

test('pull_request with shortLink at end', async () => {
  const req = {
    body: {
      action: 'opened',
      pull_request: {
        html_url: 'https://github.com/github/linguist/pull/11',
        head: { ref: '9-grand-canyon-national-park#nqPiDKmw' },
      },
    },
  };

  httpsRequest
    .mockReturnValueOnce({ id: '560bf4df7139286471dc009e' }) // postUrlAttachment
    .mockReturnValueOnce({ id: '5b61cb39d057323aaa8500b8' }) // getBoardId
    .mockReturnValueOnce([]) // getCustomFields
    .mockReturnValueOnce({ // postCustomFields
      id: '5b6be1a48dc4214d1313b650',
      idModel: '5b61cb39d057323aaa8500b8',
      modelType: 'board',
      fieldGroup: '3ac58266f323d0ff02ab458154fe4e2fcf27d7c63beda514c5ab19cdbdf0558c',
      display: { cardFront: true },
      name: 'PR',
      pos: 24576,
      options: [
        {
          id: '5b6be1a48dc4214d1313b652',
          idCustomField: '5b6be1a48dc4214d1313b650',
          value: {
            text: 'Open',
          },
          color: 'green',
          pos: 36864,
        },
      ],
      type: 'list',
    })
    .mockReturnValueOnce({ // putCustomFieldList
      id: '5b6be1a48dc4214d1313b652',
      idValue: '5b6be1a48dc4214d1313b653',
      idCustomField: '5b6be1a48dc4214d1313b650',
      idModel: '5b61cb39d057323aaa8500b8',
      modelType: 'card',
    });

  const request = await githubToTrello('pull_request', req);
  expect(request.body.id).toEqual('5b6be1a48dc4214d1313b652');
  expect(request.location).toEqual('https://trello.com/c/nqPiDKmw');
});

test('pull_request with shortLink at beginning', async () => {
  const req = {
    body: {
      action: 'opened',
      pull_request: {
        html_url: 'https://github.com/github/linguist/pull/11',
        head: { ref: 'nqPiDKmw/9-grand-canyon-national-park' },
      },
    },
  };

  httpsRequest
    .mockReturnValueOnce({ id: '560bf4df7139286471dc009e' }) // postUrlAttachment
    .mockReturnValueOnce({ id: '5b61cb39d057323aaa8500b8' }) // getBoardId
    .mockReturnValueOnce([]) // getCustomFields
    .mockReturnValueOnce({ // postCustomFields
      id: '5b6be1a48dc4214d1313b650',
      idModel: '5b61cb39d057323aaa8500b8',
      modelType: 'board',
      fieldGroup: '3ac58266f323d0ff02ab458154fe4e2fcf27d7c63beda514c5ab19cdbdf0558c',
      display: { cardFront: true },
      name: 'PR',
      pos: 24576,
      options: [
        {
          id: '5b6be1a48dc4214d1313b652',
          idCustomField: '5b6be1a48dc4214d1313b650',
          value: {
            text: 'Open',
          },
          color: 'green',
          pos: 36864,
        },
      ],
      type: 'list',
    })
    .mockReturnValueOnce({ // putCustomFieldList
      id: '5b6be1a48dc4214d1313b652',
      idValue: '5b6be1a48dc4214d1313b653',
      idCustomField: '5b6be1a48dc4214d1313b650',
      idModel: '5b61cb39d057323aaa8500b8',
      modelType: 'card',
    });

  const request = await githubToTrello('pull_request', req);
  expect(request.body.id).toEqual('5b6be1a48dc4214d1313b652');
  expect(request.location).toEqual('https://trello.com/c/nqPiDKmw');
});

test('pull_request closed but not merged', async () => {
  const req = {
    body: {
      action: 'closed',
      pull_request: {
        html_url: 'https://github.com/github/linguist/pull/11',
        head: { ref: '9-grand-canyon-national-park#nqPiDKmw' },
        merged: false,
      },
    },
  };

  httpsRequest
    .mockReturnValueOnce({ id: '5b61cb39d057323aaa8500b8' }) // getBoardId
    .mockReturnValueOnce([{ // getCustomFields (truncated)
      name: 'PR',
      options: [
        {
          value: {
            text: 'Closed',
          },
        },
      ],
    }])
    .mockReturnValueOnce({ // putCustomFieldList (truncated)
      id: '5b6be1a48dc4214d1313b652',
    });

  const request = await githubToTrello('pull_request', req);
  expect(request.body.id).toEqual('5b6be1a48dc4214d1313b652');
  expect(request.location).toEqual('https://trello.com/c/nqPiDKmw');
});

test('pull_request closed and merged', async () => {
  const req = {
    body: {
      action: 'closed',
      pull_request: {
        html_url: 'https://github.com/github/linguist/pull/11',
        head: { ref: '9-grand-canyon-national-park#nqPiDKmw' },
        merged: true,
      },
    },
  };

  httpsRequest
    .mockReturnValueOnce({ id: '5b61cb39d057323aaa8500b8' }) // getBoardId
    .mockReturnValueOnce([{ // getCustomFields (truncated)
      name: 'PR',
      options: [
        {
          value: {
            text: 'Merged',
          },
        },
      ],
    }])
    .mockReturnValueOnce({ // putCustomFieldList (truncated)
      id: '5b6be1a48dc4214d1313b652',
    });

  const request = await githubToTrello('pull_request', req);
  expect(request.body.id).toEqual('5b6be1a48dc4214d1313b652');
  expect(request.location).toEqual('https://trello.com/c/nqPiDKmw');
});

test('pull_request customfieldsx not enabled', async () => {
  const req = {
    body: {
      action: 'closed',
      pull_request: {
        html_url: 'https://github.com/github/linguist/pull/11',
        head: { ref: '9-grand-canyon-national-park#nqPiDKmw' },
      },
    },
  };

  httpsRequest
    .mockReturnValueOnce({ id: '5b61cb39d057323aaa8500b8' }) // getBoardId
    .mockReturnValueOnce([]) // getCustomFields
    .mockImplementationOnce(() => {
      throw new HTTPError(403);
    });

  await expect(githubToTrello('pull_request', req)).rejects.toThrowError(
    expect.objectContaining({ statusCode: 403, message: 'Custom Fields Power-Up not enabled for board 5b61cb39d057323aaa8500b8' }),
  );
});

test('pull_request missingx status option', async () => {
  const req = {
    body: {
      action: 'closed',
      pull_request: {
        html_url: 'https://github.com/github/linguist/pull/11',
        head: { ref: '9-grand-canyon-national-park#nqPiDKmw' },
      },
    },
  };

  httpsRequest
    .mockReturnValueOnce({ id: '5b61cb39d057323aaa8500b8' }) // getBoardId
    .mockReturnValueOnce([{ // getCustomFields (truncated)
      name: 'PR',
      options: [
        {
          value: {
            text: 'Open',
          },
        },
      ],
    }]);

  await expect(githubToTrello('pull_request', req)).rejects.toThrowError(
    expect.objectContaining({ statusCode: 500, message: 'Custom Fields for PR missing status Closed' }),
  );
});

test('pull_request with invalid branch name', async () => {
  const req = {
    body: {
      action: 'opened',
      pull_request: {
        html_url: 'https://github.com/github/linguist/pull/11',
        head: { ref: 'abcdef/9-grand-canyon-national-park' },
      },
    },
  };

  await expect(githubToTrello('pull_request', req)).rejects.toThrow(/^No shortLink found in branch abcdef\/9-grand-canyon-national-park$/);
});

test('pull_request with unsupported action', async () => {
  const req = {
    body: {
      action: 'labeled',
      pull_request: {
        html_url: 'https://github.com/github/linguist/pull/11',
        head: { ref: '9-grand-canyon-national-park#nqPiDKmw' },
      },
    },
  };

  const request = await githubToTrello('pull_request', req);
  expect(request.body).toEqual('Ignored unsupported pull_request action: labeled');
});
