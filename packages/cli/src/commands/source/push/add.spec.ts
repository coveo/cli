jest.mock('../../../lib/config/config');
jest.mock('../../../hooks/analytics/analytics');
jest.mock('../../../hooks/prerun/prerun');
jest.mock('../../../lib/platform/authenticatedClient');
jest.mock('@coveo/push-api-client');

import {mocked} from 'ts-jest/utils';
import {test} from '@oclif/test';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {DocumentBuilder, Source} from '@coveo/push-api-client';
import {cwd} from 'process';
const mockedClient = mocked(AuthenticatedClient);
const mockedSource = mocked(Source);
const mockedDocumentBuilder = mocked(DocumentBuilder);

describe('source:push:add', () => {
  const doMockAxiosError = (
    status: number,
    message: string,
    errorCode: string
  ) => ({
    response: {
      status,
      data: {
        errorCode,
        message,
      },
    },
  });

  const doMockAxiosSuccess = (status: number, text: string) => ({
    status,
    statusText: text,
  });

  const mockBatchUpdate = jest
    .fn()
    .mockReturnValue(Promise.resolve(doMockAxiosSuccess(202, '👌')));

  mockedClient.mockImplementation(
    () =>
      ({
        cfg: {
          get: () =>
            Promise.resolve({
              accessToken: 'the_token',
              organization: 'the_org',
            }),
        },
      } as unknown as AuthenticatedClient)
  );

  mockedSource.mockImplementation(
    () =>
      ({
        batchUpdateDocuments: mockBatchUpdate,
      } as unknown as Source)
  );

  mockedDocumentBuilder.mockImplementation(
    () =>
      ({
        marshal: () =>
          JSON.stringify({
            documentId: 'https://perdu.com',
            title: 'hello world',
          }),
        withData: jest.fn(),
        withDate: jest.fn(),
        withFileExtension: jest.fn(),
        withMetadataValue: jest.fn(),
      } as unknown as DocumentBuilder)
  );

  beforeAll(() => {});

  test
    .stdout()
    .command(['source:push:add', 'mysource'])
    .catch(/You must minimally set the `file` or the `folder` flag/)
    .it('throws when no flags are specified');

  test
    .stdout()
    .command(['source:push:add', 'mysource', '-f', 'foo', '-d', 'bar'])
    .catch(/--folder= cannot also be provided when using --file=/)
    .it('throws when incompatible flags for file and folder are passed');

  test
    .stdout()
    .command([
      'source:push:add',
      'mysource',
      '-f',
      cwd() + '/src/__stub__/jsondocuments/batman.json',
    ])
    .it('pass correct configuration information to push-api-client', () => {
      expect(mockedSource).toHaveBeenCalledWith('the_token', 'the_org');
    });

  test
    .command(['source:push:add', 'mysource', '-f', 'should_explode'])
    .catch(/should_explode is not a valid file, or does not exists/)
    .it('returns an error when trying to load a file that does not exists');

  test
    .stdout()
    .command([
      'source:push:add',
      'mysource',
      '-f',
      cwd() + '/src/__stub__/jsondocuments/batman.json',
    ])
    .it('should output feedback message when parsing documents', (ctx) => {
      expect(ctx.stdout).toContain(
        `Parsed ${cwd()}/src/__stub__/jsondocuments/batman.json into 2 documents`
      );
    });

  test
    .stdout()
    .command([
      'source:push:add',
      'mysource',
      '-f',
      cwd() + '/src/__stub__/jsondocuments/batman.json',
    ])
    .it('should output feedback message when uploading documents', (ctx) => {
      expect(ctx.stdout).toContain(
        `Success: 2 documents accepted by the Push API from ${cwd()}/src/__stub__/jsondocuments/batman.json.`
      );
      expect(ctx.stdout).toContain('Status code: 202 👌');
    });

  test
    .stdout()
    .command([
      'source:push:add',
      'mysource',
      '-f',
      cwd() + '/src/__stub__/jsondocuments/noID.json',
    ])
    .catch(
      `${cwd()}/src/__stub__/jsondocuments/noID.json is not a valid JSON document: Document contains an invalid value for documentid: value is required.`
    )
    .it('should output error message on missing documentID');

  test
    .stdout()
    .command([
      'source:push:add',
      'mysource',
      '-f',
      cwd() + '/src/__stub__/jsondocuments/noTitle.json',
    ])
    .catch(
      `${cwd()}/src/__stub__/jsondocuments/noTitle.json is not a valid JSON document: Document contains an invalid value for title: value is required.`
    )
    .it('should output error message on missing title');

  test
    .stdout()
    .command([
      'source:push:add',
      'mysource',
      '-f',
      cwd() + '/src/__stub__/jsondocuments/invalidID.json',
    ])
    .catch(
      `${cwd()}/src/__stub__/jsondocuments/invalidID.json is not a valid JSON document: Document contains an invalid value for documentid: value is not a valid URL.`
    )
    .it('should output error message on invalid format for documentID');

  test
    .do(() => {
      mockBatchUpdate.mockRejectedValueOnce(
        doMockAxiosError(
          412,
          'this is a bad request and you should feel bad',
          'BAD_REQUEST'
        )
      );
    })
    .stdout()
    .stderr()
    .command([
      'source:push:add',
      'mysource',
      '-f',
      cwd() + '/src/__stub__/jsondocuments/batman.json',
    ])
    .catch(/this is a bad request and you should feel bad/)
    .it('returns an information message on add failure from the API');
});
