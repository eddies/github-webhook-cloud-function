const {
  postComment, postUrlAttachment, postCustomFields, putCustomFieldList, putCustomField,
} = require('../../src/util/trello');

jest.mock('../../src/util/httpsRequest');
const { httpsRequest } = require('../../src/util/httpsRequest');

test('postComment', async () => {
  httpsRequest.mockResolvedValue({ id: '560bf4df7139286471dc009e' });
  const request = await postComment('nqPiDKmw', 'Hello, world!');
  expect(request.body).toEqual({ id: '560bf4df7139286471dc009e' });
  expect(request.location).toEqual('https://trello.com/c/nqPiDKmw/#comment-560bf4df7139286471dc009e');
});

test('postUrlAttachment', async () => {
  httpsRequest.mockResolvedValue({ id: '560bf4df7139286471dc009e' });
  const request = await postUrlAttachment('nqPiDKmw', 'https://github.com/github/linguist/pull/11');
  expect(request.body).toEqual({ id: '560bf4df7139286471dc009e' });
  expect(request.location).toEqual('https://trello.com/c/nqPiDKmw/#action-560bf4df7139286471dc009e');
});

test('postCustomFields', async () => {
  httpsRequest.mockResolvedValue({
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
          text: 'Closed',
        },
        color: 'red',
        pos: 36864,
      },
    ],
    type: 'list',

  });
  const prFields = await postCustomFields('5b61cb39d057323aaa8500b8', [
    {
      color: 'red',
      value: {
        text: 'Closed',
      },
      pos: 2048,
    },
  ]);
  expect(prFields.idModel).toEqual('5b61cb39d057323aaa8500b8');
});

test('putCustomFieldList', async () => {
  httpsRequest.mockResolvedValue({
    id: '5b6c740402e6d67bb321e701',
    idValue: '5b6be1a48dc4214d1313b653',
    idCustomField: '5b6be1a48dc4214d1313b650',
    idModel: '5b6701a089d45b33a885ac8b',
    modelType: 'card',
  });
  const request = await putCustomFieldList('nqPiDKmw', '5b6be1a48dc4214d1313b650', '5b6be1a48dc4214d1313b653');
  expect(request.body.idModel).toEqual('5b6701a089d45b33a885ac8b');
});

test('putCustomField', async () => {
  httpsRequest.mockResolvedValue({
    id: '5b6c740402e6d67bb321e701',
    value: '{ "text": "alice"}',
    idCustomField: '5d1475299bd16c39d34bd8b8',
    idModel: '5b6701a089d45b33a885ac8b',
    modelType: 'card',
  });
  const request = await putCustomField('nqPiDKmw', '5d1475299bd16c39d34bd8b8', '{ "text": "alice"}');
  expect(request.body.idModel).toEqual('5b6701a089d45b33a885ac8b');
  expect(request.body.value).toEqual('{ "text": "alice"}');
});
