jest.mock('../../../hooks/analytics/analytics');
jest.mock('../../../hooks/prerun/prerun');
jest.mock('../../../lib/platform/authenticatedClient');
jest.mock('../../../lib/config/globalConfig');
jest.mock('@coveo/push-api-client');

import stripAnsi from 'strip-ansi';
import {test} from '@oclif/test';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {CatalogSource, DocumentBuilder} from '@coveo/push-api-client';
import {cwd} from 'process';
import {join} from 'path';
import {APIError} from '../../../lib/errors/APIError';
import {Interfaces} from '@oclif/core';
import globalConfig from '../../../lib/config/globalConfig';
import {
  BatchUploadDocumentsError,
  BatchUploadDocumentsSuccess,
} from '../../../__stub__/batchUploadDocumentsFromFilesReturn';
const mockedGlobalConfig = jest.mocked(globalConfig);
const mockedClient = jest.mocked(AuthenticatedClient);
const mockedSource = jest.mocked(CatalogSource);
const mockedDocumentBuilder = jest.mocked(DocumentBuilder);
const mockedMarshal = jest.fn();
const mockEvaluate = jest.fn();
const mockSourceGet = jest.fn();
const mockSetSourceStatus = jest.fn();
const mockBatchUpdate = jest.fn();
const mockBatchStream = jest.fn();

describe('source:catalog:add', () => {
  const pathToStub = join(cwd(), 'src', '__stub__');

  const sourceContainsDocuments = () => {
    mockSourceGet.mockResolvedValue({
      information: {numberOfDocuments: 1},
    });
  };

  const sourceDoesNotContainDocuments = () => {
    mockSourceGet.mockResolvedValue({
      information: {numberOfDocuments: 0},
    });
  };

  const mockUserHavingAllRequiredPlatformPrivileges = () => {
    mockEvaluate.mockResolvedValue({approved: true});
  };

  const mockUserNotHavingAllRequiredPlatformPrivileges = () => {
    mockEvaluate.mockResolvedValue({approved: false});
  };

  const doMockSuccessUpload = () => {
    mockBatchUpdate.mockReturnValue(new BatchUploadDocumentsSuccess());
    mockBatchStream.mockReturnValue(new BatchUploadDocumentsSuccess());
  };

  const doMockErrorUpload = () => {
    mockBatchUpdate.mockReturnValue(new BatchUploadDocumentsError());
    mockBatchStream.mockReturnValue(new BatchUploadDocumentsError());
  };

  const doMockDocumentBuilder = () => {
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
  };
  const doMockAuthenticatedClient = () => {
    mockedClient.mockImplementation(
      () =>
        ({
          getClient: () =>
            Promise.resolve({
              privilegeEvaluator: {
                evaluate: mockEvaluate,
              },
              source: {
                get: mockSourceGet,
              },
            }),
          cfg: {
            get: () =>
              Promise.resolve({
                accessToken: 'the_token',
                organization: 'the_org',
                region: 'au',
                environment: 'prod',
              }),
          },
        } as unknown as AuthenticatedClient)
    );
  };

  const doMockSource = () => {
    mockedSource.mockImplementation(
      () =>
        ({
          batchUpdateDocumentsFromFiles: mockBatchUpdate,
          batchStreamDocumentsFromFiles: mockBatchStream,
          setSourceStatus: mockSetSourceStatus,
        } as unknown as CatalogSource)
    );
  };

  beforeAll(() => {
    doMockDocumentBuilder();
    doMockAuthenticatedClient();
    doMockSource();

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

  mockedSource.mockImplementation(
    () =>
      ({
        batchUpdateDocumentsFromFiles: mockBatchUpdate,
        setSourceStatus: mockSetSourceStatus,
      } as unknown as CatalogSource)
  );

  describe('when the batch upload is successfull', () => {
    beforeAll(() => {
      mockUserHavingAllRequiredPlatformPrivileges();
      doMockSuccessUpload();
      sourceContainsDocuments();
    });

    afterAll(() => {
      mockBatchUpdate.mockReset();
      mockEvaluate.mockReset();
      mockSourceGet.mockReset();
    });

    test
      .stdout()
      .stderr()
      .command(['source:catalog:add', 'mysource'])
      .catch(/You must minimally set the `file` or the `folder` flag/)
      .it('throws when no flags are specified');

    test
      .stdout()
      .stderr()
      .command(['source:catalog:add', 'mysource', '-f', 'foo', '-d', 'bar'])
      .catch(/--folder= cannot also be provided when using --file=/)
      .it('throws when incompatible flags for file and folder are passed');

    test
      .stdout()
      .stderr()
      .command([
        'source:catalog:add',
        'mysource',
        '-f',
        join(pathToStub, 'jsondocuments', 'batman.json'),
      ])
      .it('should trigger a batch document update', () => {
        expect(mockBatchUpdate).toHaveBeenCalled();
        expect(mockBatchStream).not.toHaveBeenCalled();
      });

    test
      .stdout()
      .stderr()
      .command([
        'source:catalog:add',
        'mysource',
        '--fullUpload',
        '-f',
        join(pathToStub, 'jsondocuments', 'batman.json'),
      ])
      .it('should trigger a batch stream upload ', () => {
        expect(mockBatchStream).toHaveBeenCalled();
        expect(mockBatchUpdate).not.toHaveBeenCalled();
      });

    test
      .stdout()
      .stderr()
      .command([
        'source:catalog:add',
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
        'source:catalog:add',
        'mysource',
        '-f',
        join(pathToStub, 'jsondocuments', 'batman.json'),
      ])
      .it('should create missing fields by default', () => {
        expect(mockBatchUpdate).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({createFields: true})
        );
      });

    test
      .stdout()
      .stderr()
      .command([
        'source:catalog:add',
        'mysource',
        '--no-createMissingFields',
        '-f',
        join(pathToStub, 'jsondocuments', 'batman.json'),
      ])
      .it('should skip field creation if specified', () => {
        expect(mockBatchUpdate).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({createFields: false})
        );
      });

    test
      .stdout()
      .stderr()
      .command([
        'source:catalog:add',
        'mysource',
        '-f',
        join(pathToStub, 'jsondocuments', 'someJsonFile.json'),
      ])
      .it('should output feedback message when uploading documents', (ctx) => {
        expect(ctx.stdout).toContain(
          'Success: 2 documents accepted by the API from'
        );
        expect(ctx.stdout).toContain('Status code: 202 👌');
      });

    test
      .stdout()
      .stderr()
      .command([
        'source:catalog:add',
        'mysource',
        '-d',
        join(pathToStub, 'jsondocuments'),
      ])
      .it(
        'should output feedback message when uploading a directory',
        (ctx) => {
          expect(ctx.stdout).toContain(
            'Success: 2 documents accepted by the API from'
          );
          expect(ctx.stdout).toContain('Status code: 202 👌');
        }
      );

    test
      .stdout()
      .stderr()
      .command([
        'source:catalog:add',
        'mysource',
        '-f',
        join(pathToStub, 'jsondocuments', 'batman.json'),
      ])
      .it('should get source info during document update', () => {
        expect(mockSourceGet).toHaveBeenCalled();
      });

    test
      .stdout()
      .stderr()
      .command([
        'source:catalog:add',
        'mysource',
        '--fullUpload',
        '-f',
        join(pathToStub, 'jsondocuments', 'batman.json'),
      ])
      .it('should not get source info during document update', () => {
        expect(mockSourceGet).not.toHaveBeenCalled();
      });

    describe('when the source does not contain items', () => {
      beforeAll(() => {
        mockSourceGet.mockReset();
        sourceDoesNotContainDocuments();
      });

      test
        .stdout()
        .stderr()
        .command([
          'source:catalog:add',
          'mysource',
          '-f',
          join(pathToStub, 'jsondocuments', 'batman.json'),
        ])
        .catch(/No items detected for this source at the moment/)
        .it('should show error message during document update');

      test
        .stdout()
        .stderr()
        .command([
          'source:catalog:add',
          'mysource',
          '--skipFullUploadCheck',
          '-f',
          join(pathToStub, 'jsondocuments', 'batman.json'),
        ])
        .it(
          'should not show a error message when using the --skipFullUploadCheck flag',
          (ctx) => {
            expect(ctx.stderr).not.toContain(
              'please consider doing a full catalog upload'
            );
          }
        );
    });
  });

  describe('when the batch upload fails', () => {
    beforeAll(() => {
      doMockErrorUpload();
      mockUserHavingAllRequiredPlatformPrivileges();
      sourceContainsDocuments();
    });

    afterAll(() => {
      mockBatchUpdate.mockReset();
      mockEvaluate.mockReset();
      mockSourceGet.mockReset();
    });

    test
      .stdout()
      .stderr()
      .command([
        'source:catalog:add',
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
      sourceContainsDocuments();
    });

    afterAll(() => {
      mockBatchUpdate.mockReset();
      mockEvaluate.mockReset();
      mockSourceGet.mockReset();
    });

    test
      .stdout()
      .stderr()
      .command(['source:catalog:add', 'some-org', '-f', 'some-file'])
      .catch(/You are not authorized to create or update fields/)
      .it('should return a precondition error');
  });
});
