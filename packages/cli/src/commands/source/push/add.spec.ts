jest.mock('../../../lib/config/config');
jest.mock('../../../hooks/analytics/analytics');
jest.mock('../../../hooks/prerun/prerun');
jest.mock('../../../lib/platform/authenticatedClient');
jest.mock('../../../lib/config/globalConfig');
jest.mock('@coveo/push-api-client');

import stripAnsi from 'strip-ansi';
import {test} from '@oclif/test';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {DocumentBuilder, Source} from '@coveo/push-api-client';
import {cwd} from 'process';
import {join} from 'path';
import {
  doMockAxiosError,
  doMockAxiosSuccess,
} from '../../../lib/push/testUtils';
import {APIError} from '../../../lib/errors/APIError';
import {UploadBatchCallback} from '@coveo/push-api-client';
import globalConfig from '../../../lib/config/globalConfig';
import {Interfaces} from '@oclif/core';
import {Config} from '../../../lib/config/config';
const mockedGlobalConfig = jest.mocked(globalConfig);
const mockedClient = jest.mocked(AuthenticatedClient);
const mockedSource = jest.mocked(Source);
const mockedDocumentBuilder = jest.mocked(DocumentBuilder);
const mockedMarshal = jest.fn();
const mockEvaluate = jest.fn();
const mockedConfig = jest.mocked(Config);
const mockedConfigGet = jest.fn();

describe('source:push:add', () => {
  const pathToStub = join(cwd(), 'src', '__stub__');
  const mockSetSourceStatus = jest.fn();
  const mockBatchUpdate = jest.fn();

  const mockUserHavingAllRequiredPlatformPrivileges = () => {
    mockEvaluate.mockResolvedValue({approved: true});
  };

  const mockUserNotHavingAllRequiredPlatformPrivileges = () => {
    mockEvaluate.mockResolvedValue({approved: false});
  };

  const mockConfig = () => {
    mockedConfigGet.mockReturnValue({
      region: 'us',
      organization: 'foo',
      environment: 'prod',
    });

    mockedConfig.prototype.get = mockedConfigGet;
  };

  const doMockSuccessBatchUpload = () => {
    mockBatchUpdate.mockImplementation(
      (_sourceId: string, fileNames: string[], callback: UploadBatchCallback) =>
        callback(null, {
          files: fileNames,
          batch: [
            new DocumentBuilder('somwhereintheinternet.com', 'Somewhere'),
            new DocumentBuilder('another.uri.com', 'The Title'),
          ],
          res: doMockAxiosSuccess(202, '👌'),
        })
    );
  };

  const doMockErrorBatchUpload = () => {
    mockBatchUpdate.mockImplementation(
      (_sourceId: string, fileNames: string[], callback: UploadBatchCallback) =>
        callback(
          doMockAxiosError(
            412,
            'this is a bad request and you should feel bad',
            'BAD_REQUEST'
          ),
          {
            files: fileNames,
            batch: [],
          }
        )
    );
  };

  beforeAll(() => {
    mockConfig();
    mockedGlobalConfig.get.mockReturnValue({
      configDir: 'the_config_dir',
    } as Interfaces.Config);
  });

  beforeEach(() => {
    mockedMarshal.mockReturnValue(
      JSON.stringify({
        documentId: 'https://perdu.com',
        title: 'hello world',
      })
    );
  });

  mockedDocumentBuilder.mockImplementation(
    () =>
      ({
        marshal: mockedMarshal,
        withData: jest.fn(),
        withDate: jest.fn(),
        withFileExtension: jest.fn(),
        withMetadataValue: jest.fn(),
      } as unknown as DocumentBuilder)
  );

  mockedClient.mockImplementation(
    () =>
      ({
        getClient: () =>
          Promise.resolve({
            privilegeEvaluator: {
              evaluate: mockEvaluate,
            },
          }),
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
        batchUpdateDocumentsFromFiles: mockBatchUpdate,
        setSourceStatus: mockSetSourceStatus,
      } as unknown as Source)
  );

  describe('when the batch upload is successfull', () => {
    beforeAll(() => {
      mockUserHavingAllRequiredPlatformPrivileges();
      doMockSuccessBatchUpload();
    });

    afterAll(() => {
      mockBatchUpdate.mockReset();
      mockEvaluate.mockReset();
    });

    test
      .stdout()
      .stderr()
      .command(['source:push:add', 'mysource'])
      .catch(/You must minimally set the `file` or the `folder` flag/)
      .it('throws when no flags are specified');

    test
      .stdout()
      .stderr()
      .command(['source:push:add', 'mysource', '-f', 'foo', '-d', 'bar'])
      .catch(/--folder= cannot also be provided when using --file=/)
      .it('throws when incompatible flags for file and folder are passed');

    test
      .stdout()
      .stderr()
      .command([
        'source:push:add',
        'mysource',
        '-f',
        join(pathToStub, 'jsondocuments', 'batman.json'),
      ])
      .it('pass correct configuration information to push-api-client', () => {
        expect(mockedSource).toHaveBeenCalledWith('the_token', 'the_org', {
          environment: 'prod',
          region: 'au',
        });
      });

    test
      .stdout()
      .stderr()
      .command([
        'source:push:add',
        'mysource',
        '-f',
        join(pathToStub, 'jsondocuments', 'batman.json'),
      ])
      .it('should create missing fields by default', () => {
        expect(mockBatchUpdate).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.objectContaining({createFields: true})
        );
      });

    test
      .stdout()
      .stderr()
      .command([
        'source:push:add',
        'mysource',
        '--no-createMissingFields',
        '-f',
        join(pathToStub, 'jsondocuments', 'batman.json'),
      ])
      .it('should skip field creation if specified', () => {
        expect(mockBatchUpdate).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.objectContaining({createFields: false})
        );
      });

    test
      .stdout()
      .stderr()
      .command([
        'source:push:add',
        'mysource',
        '-f',
        join(pathToStub, 'jsondocuments', 'someJsonFile.json'),
      ])
      .it('should output feedback message when uploading documents', (ctx) => {
        expect(ctx.stdout).toContain(
          'Success: 2 documents accepted by the Push API from'
        );
        expect(ctx.stdout).toContain('Status code: 202 👌');
      });

    test
      .stdout()
      .stderr()
      .command([
        'source:push:add',
        'mysource',
        '-d',
        join(pathToStub, 'jsondocuments'),
      ])
      .it(
        'should output feedback message when uploading a directory',
        (ctx) => {
          expect(ctx.stdout).toContain(
            'Success: 2 documents accepted by the Push API from'
          );
          expect(ctx.stdout).toContain('Status code: 202 👌');
        }
      );

    test
      .stdout()
      .stderr()
      .command([
        'source:push:add',
        'mysource',
        '-d',
        join(pathToStub, 'jsondocuments'),
      ])
      .it('should update the source status', () => {
        expect(mockSetSourceStatus).toHaveBeenNthCalledWith(
          1,
          'mysource',
          'REFRESH'
        );
        expect(mockSetSourceStatus).toHaveBeenNthCalledWith(
          2,
          'mysource',
          'IDLE'
        );
      });
  });

  describe('when the batch upload fails', () => {
    beforeAll(() => {
      doMockErrorBatchUpload();
      mockUserHavingAllRequiredPlatformPrivileges();
    });

    afterAll(() => {
      mockBatchUpdate.mockReset();
      mockEvaluate.mockReset();
    });

    test
      .stdout()
      .stderr()
      .command([
        'source:push:add',
        'mysource',
        '-d',
        join(pathToStub, 'jsondocuments'),
      ])
      .catch((error) => {
        expect(error).toBeInstanceOf(APIError);
        const message = stripAnsi(error.message);
        expect(message).toContain(
          'this is a bad request and you should feel bad'
        );
        expect(message).toContain('Status code: 412');
        expect(message).toContain('Error code: BAD_REQUEST');
      })
      .it('returns an information message on add failure from the API');
  });

  describe('when Platform privilege preconditions are not respected', () => {
    beforeEach(() => {
      mockUserNotHavingAllRequiredPlatformPrivileges();
    });

    afterAll(() => {
      mockBatchUpdate.mockReset();
      mockEvaluate.mockReset();
    });

    test
      .stdout()
      .stderr()
      .command(['source:push:add', 'some-org', '-f', 'some-file'])
      .catch(/You are not authorized to create or update fields/)
      .it('should return a precondition error');
  });
});
