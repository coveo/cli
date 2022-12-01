jest.mock('@coveo/cli-commons/preconditions/trackable');
jest.mock('@coveo/cli-commons/preconditions/authenticated');
jest.mock('@coveo/cli-commons/preconditions/apiKeyPrivilege');

jest.mock('@coveo/cli-commons/platform/authenticatedClient');

jest.mock('@coveo/push-api-client');

import {test} from '@oclif/test';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {CatalogSource} from '@coveo/push-api-client';
import {APIError} from '@coveo/cli-commons/errors/apiError';

import {
  BatchUploadDocumentsError,
  BatchUploadDocumentsSuccess,
} from '../../../lib/__testsUtils__/batchUploadDocumentsFromFilesReturn';
import {mockPreconditions} from '@coveo/cli-commons/preconditions/mockPreconditions';
import {
  IsAuthenticated,
  HasNecessaryCoveoPrivileges,
} from '@coveo/cli-commons/preconditions';
import {formatCliLog} from '@coveo/cli-commons-dev/testUtils/jestSnapshotUtils';

describe('source:catalog:add', () => {
  const mockedClient = jest.mocked(AuthenticatedClient);
  const mockedSource = jest.mocked(CatalogSource);
  const mockSourceGet = jest.fn();
  const mockSetSourceStatus = jest.fn();
  const mockBatchUpdate = jest.fn();
  const mockBatchStream = jest.fn();
  const mockedIsAuthenticated = jest.mocked(IsAuthenticated);
  const mockedHasNecessaryCoveoPrivileges = jest.mocked(
    HasNecessaryCoveoPrivileges
  );
  const doMockPreconditions = function () {
    const preconditionStatus = {
      authentication: true,
      privileges: true,
    };
    const mockedPreconditions = mockPreconditions(preconditionStatus);
    mockedIsAuthenticated.mockReturnValue(mockedPreconditions.authentication);
    mockedHasNecessaryCoveoPrivileges.mockReturnValue(
      mockedPreconditions.privileges
    );
  };

  const doMockSourceGet = (numberOfDocuments: number) => {
    mockSourceGet.mockResolvedValue({
      information: {numberOfDocuments},
    });
  };

  const doMockSuccessUpload = (numberOfDocuments = 2) => {
    mockBatchUpdate.mockReturnValue(
      new BatchUploadDocumentsSuccess(numberOfDocuments)
    );
    mockBatchStream.mockReturnValue(
      new BatchUploadDocumentsSuccess(numberOfDocuments)
    );
  };

  const doMockErrorUpload = () => {
    mockBatchUpdate.mockReturnValue(new BatchUploadDocumentsError());
    mockBatchStream.mockReturnValue(new BatchUploadDocumentsError());
  };

  const doMockAuthenticatedClient = () => {
    mockedClient.mockImplementation(
      () =>
        ({
          getClient: () =>
            Promise.resolve({
              source: {
                get: mockSourceGet,
              },
            }),
          cfg: {
            get: () => ({
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

  beforeEach(() => {
    doMockPreconditions();
    doMockAuthenticatedClient();
    doMockSource();
    doMockSourceGet(1);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when the batch upload is successful', () => {
    beforeEach(() => {
      doMockSuccessUpload();
    });

    test
      .stdout()
      .stderr()
      .command(['source:catalog:add', 'mysource'])
      .catch((err) => {
        expect(err.message).toMatchSnapshot();
      })
      .it('throws when no flags are specified');

    test
      .stdout()
      .stderr()
      .command(['source:catalog:add', 'mysource', '-f', 'somefile'])
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
        'somefile',
      ])
      .it('should trigger a batch stream upload ', () => {
        expect(mockBatchStream).toHaveBeenCalled();
        expect(mockBatchUpdate).not.toHaveBeenCalled();
      });

    test
      .stdout()
      .stderr()
      .command(['source:catalog:add', 'mysource', '-f', 'somefile'])
      .it('pass correct configuration information to push-api-client', () => {
        expect(mockedSource).toHaveBeenCalledWith('the_token', 'the_org', {
          environment: 'prod',
          region: 'au',
        });
      });

    test
      .stdout()
      .stderr()
      .command(['source:catalog:add', 'mysource', '-f', 'somefile'])
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
        'somefile',
      ])
      .it('should skip field creation if specified', () => {
        expect(mockBatchUpdate).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({createFields: false})
        );
      });

    describe.each([1, 2, 3, 4, 5, 6])(
      'when uploading %d documents',
      (numberOfDocuments) => {
        beforeEach(() => {
          doMockSuccessUpload(numberOfDocuments);
        });

        test
          .stdout()
          .stderr()
          .command(['source:catalog:add', 'mysource', '-f', 'somepath'])
          .it('should print the appropriate # of documents', (ctx) => {
            expect(formatCliLog(ctx.stdout)).toMatchSnapshot();
          });
      }
    );

    test
      .stdout()
      .stderr()
      .command(['source:catalog:add', 'mysource', '-f', 'somefile'])
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
        'somefile',
      ])
      .it('should not get source info during document update', () => {
        expect(mockSourceGet).not.toHaveBeenCalled();
      });
    describe('when the source does not contain items', () => {
      beforeEach(() => {
        doMockSourceGet(0);
      });

      test
        .stdout()
        .stderr()
        .command(['source:catalog:add', 'mysource', '-f', 'somefile'])
        .catch((err) => {
          expect(err.message).toMatchSnapshot();
        })
        .it('should show error message during document update');

      test
        .stdout()
        .stderr()
        .command([
          'source:catalog:add',
          'mysource',
          '--skipFullUploadCheck',
          '-f',
          'somefile',
        ])
        .it(
          'should not show a error message when using the --skipFullUploadCheck flag',
          (ctx) => {
            expect(formatCliLog(ctx.stderr)).toMatchSnapshot();
          }
        );
    });
  });

  describe('when the batch upload fails', () => {
    beforeEach(() => {
      doMockErrorUpload();
    });

    test
      .stdout()
      .stderr()
      .command(['source:catalog:add', 'mysource', '-f', 'somefile'])
      .catch((err) => {
        expect(err).toBeInstanceOf(APIError);
        expect(err.message).toMatchSnapshot();
      })
      .it('returns an information message on add failure from the API');

    test
      .stdout()
      .stderr()
      .command(['source:catalog:add', 'mysource', '-f', 'somefile'])
      .catch((err) => {
        expect(err).toBeInstanceOf(APIError);
      })
      .it('returns a summary even if an error is thrown', (ctx) => {
        expect(ctx.stdout).toMatchSnapshot();
      });
  });
});
