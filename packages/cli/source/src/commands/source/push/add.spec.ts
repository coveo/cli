jest.mock('@coveo/cli-commons/preconditions/trackable');
jest.mock('@coveo/cli-commons/preconditions/authenticated');
jest.mock('@coveo/cli-commons/preconditions/apiKeyPrivilege');

jest.mock('@coveo/cli-commons/platform/authenticatedClient');
jest.mock('@coveo/push-api-client');

import {test} from '@oclif/test';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {PushSource} from '@coveo/push-api-client';
import {APIError} from '@coveo/cli-commons/errors/apiError';
import {
  BatchUploadDocumentsError,
  BatchUploadDocumentsSuccess,
} from '../../../lib/__testsUtils__/batchUploadDocumentsFromFilesReturn';
import {
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
} from '@coveo/cli-commons/preconditions';
import {mockPreconditions} from '@coveo/cli-commons/preconditions/mockPreconditions';
import {formatCliLog} from '@coveo/cli-commons-dev/testUtils/jestSnapshotUtils';

describe('source:push:add', () => {
  const mockSetSourceStatus = jest.fn();
  const mockBatchUpdate = jest.fn();
  const mockedClient = jest.mocked(AuthenticatedClient);
  const mockedSource = jest.mocked(PushSource);
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

  const doMockSuccessBatchUpload = (numberOfDocuments = 2) => {
    mockBatchUpdate.mockReturnValue(
      new BatchUploadDocumentsSuccess(numberOfDocuments)
    );
  };

  const doMockErrorBatchUpload = () => {
    mockBatchUpdate.mockReturnValue(new BatchUploadDocumentsError());
  };
  const doMockAuthenticatedClient = () => {
    mockedClient.mockImplementation(
      () =>
        ({
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
          setSourceStatus: mockSetSourceStatus,
        } as unknown as PushSource)
    );
  };

  beforeEach(() => {
    doMockAuthenticatedClient();
    doMockSource();
    doMockPreconditions();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when the batch upload is successful', () => {
    beforeEach(() => {
      doMockSuccessBatchUpload();
    });

    test
      .stdout()
      .stderr()
      .command(['source:push:add', 'mysource'])
      .catch((err) => {
        expect(err.message).toMatchSnapshot();
      })
      .it('throws when no flags are specified');

    test
      .stdout()
      .stderr()
      .command([
        'source:push:add',
        'mysource',
        '-f',
        'foo.json',
        '-d',
        'directory',
      ])
      .it('should accept files and folder within the same command', () => {
        expect(mockBatchUpdate).toHaveBeenCalledWith(
          expect.anything(),
          ['directory', 'foo.json'],
          expect.anything()
        );
      });

    test
      .stdout()
      .stderr()
      .command(['source:push:add', 'mysource', '-f', 'whatever'])
      .it('pass correct configuration information to push-api-client', () => {
        expect(mockedSource).toHaveBeenCalledWith('the_token', 'the_org', {
          environment: 'prod',
          region: 'au',
        });
      });

    test
      .stdout()
      .stderr()
      .command(['source:push:add', 'mysource', '-f', 'somepath'])
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
        'source:push:add',
        'mysource',
        '--no-createMissingFields',
        '-f',
        'somepath',
      ])
      .it('should skip field creation if specified', () => {
        expect(mockBatchUpdate).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({createFields: false})
        );
      });

    describe('when using the -d flag', () => {
      test
        .stdout()
        .stderr()
        .command(['source:push:add', 'mysource', '-d', 'somepath'])
        .it(
          'should output feedback message when uploading documents',
          (ctx) => {
            expect(formatCliLog(ctx.stdout)).toMatchSnapshot();
          }
        );
      test
        .stdout()
        .stderr()
        .command(['source:push:add', 'mysource', '-d', 'somepath'])
        .it('should show deprecated flag warning', (ctx) => {
          expect(formatCliLog(ctx.stdout)).toMatchSnapshot();
        });
    });

    describe.each([1, 2, 3, 4, 5, 6])(
      'when uploading %d documents',
      (numberOfDocuments) => {
        beforeEach(() => {
          doMockSuccessBatchUpload(numberOfDocuments);
        });

        test
          .stdout()
          .stderr()
          .command(['source:push:add', 'mysource', '-f', 'somepath'])
          .it('should print the appropriate # of documents', (ctx) => {
            expect(formatCliLog(ctx.stdout)).toMatchSnapshot();
          });
      }
    );

    test
      .stdout()
      .stderr()
      .command(['source:push:add', 'mysource', '-f', 'somepath'])
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
    beforeEach(() => {
      doMockErrorBatchUpload();
    });

    test
      .stdout()
      .stderr()
      .command(['source:push:add', 'mysource', '-f', 'somepath'])
      .catch((err) => {
        expect(err).toBeInstanceOf(APIError);
        expect(err.message).toMatchSnapshot();
      })
      .it('returns an information message on add failure from the API');
  });
});
