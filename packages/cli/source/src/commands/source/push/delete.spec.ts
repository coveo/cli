jest.mock('@coveo/cli-commons/preconditions/trackable');
jest.mock('@coveo/cli-commons/preconditions/authenticated');

jest.mock('@coveo/cli-commons/platform/authenticatedClient');
jest.mock('@coveo/push-api-client');

import {test} from '@oclif/test';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {PushSource} from '@coveo/push-api-client';
import {
  doMockAxiosError,
  doMockAxiosSuccess,
} from '../../../lib/__testsUtils__/axiosMocks';
import {IsAuthenticated} from '@coveo/cli-commons/preconditions';
import {mockPreconditions} from '@coveo/cli-commons/preconditions/mockPreconditions';
import {formatCliLog} from '@coveo/cli-commons-dev/testUtils/jestSnapshotUtils';

describe('source:push:delete', () => {
  const mockedIsAuthenticated = jest.mocked(IsAuthenticated);
  const mockedClient = jest.mocked(AuthenticatedClient);
  const mockedSource = jest.mocked(PushSource);
  const mockDeleteOlderThan = jest.fn();

  const mockDeleteDocument = jest.fn();

  const doMockPreconditions = function () {
    const preconditionStatus = {
      authentication: true,
    };
    const mockedPreconditions = mockPreconditions(preconditionStatus);
    mockedIsAuthenticated.mockReturnValue(mockedPreconditions.authentication);
  };

  const doMockAuthenticatedClient = () => {
    mockedClient.mockImplementation(
      () =>
        ({
          cfg: {
            get: () => ({
              accessToken: 'the_token',
              organization: 'the_org',
            }),
          },
        } as unknown as AuthenticatedClient)
    );
  };

  const doMockSourceDelete = () => {
    mockedSource.mockImplementation(
      () =>
        ({
          deleteDocumentsOlderThan: mockDeleteOlderThan.mockReturnValue(
            Promise.resolve(doMockAxiosSuccess(202, 'tiguidou'))
          ),
          deleteDocument: mockDeleteDocument.mockReturnValue(
            Promise.resolve(doMockAxiosSuccess(202, 'right trou'))
          ),
        } as unknown as PushSource)
    );
  };

  beforeEach(() => {
    doMockAuthenticatedClient();
    doMockPreconditions();
    doMockSourceDelete();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test
    .stdout()
    .stderr()
    .command(['source:push:delete', 'mysource'])
    .catch((err) => {
      expect(err.message).toMatchSnapshot();
    })
    .it('throws when no flags are specified');

  test
    .stdout()
    .stderr()
    .command(['source:push:delete', 'mysource', '-x', 'foo', '-d', 'bar'])
    .catch((err) => {
      expect(err.message).toMatchSnapshot();
    })
    .it(
      'throws when incompatible flags for olderThan and documentUri are passed'
    );

  test
    .stdout()
    .stderr()
    .command(['source:push:delete', 'mysource', '-d', '2000/01/01'])
    .it('pass correct configuration information to push-api-client', () => {
      expect(mockedSource).toHaveBeenCalledWith('the_token', 'the_org');
    });

  [
    '2000/01/01',
    '2000-01-01',
    '2000-01-01T06:00:00+00:00',
    'Monday, 2000-Jan-01 06:00:00 UTC',
  ].forEach((testCase) => {
    test
      .stdout()
      .stderr()
      .command(['source:push:delete', 'mysource', '-d', testCase])
      .it(
        `pass correct values to push-api-client when deleting with date as string: ${testCase}`,
        () => {
          expect(mockDeleteOlderThan).toHaveBeenCalledWith(
            'mysource',
            testCase
          );
        }
      );
  });

  test
    .stdout()
    .stderr()
    .command(['source:push:delete', 'mysource', '-d', '123123123'])
    .it(
      'pass correct values to push-api-client when deleting with date as number',
      () => {
        expect(mockDeleteOlderThan).toHaveBeenCalledWith('mysource', 123123123);
      }
    );

  test
    .do(() => {
      mockDeleteOlderThan.mockReturnValueOnce(
        doMockAxiosSuccess(999, 'this document is gone')
      );
    })
    .stdout()
    .stderr()
    .command(['source:push:delete', 'mysource', '-d', '12345'])
    .it(
      'returns an information message on successful deletion with older than',
      (ctx) => {
        expect(formatCliLog(ctx.stdout)).toMatchSnapshot();
      }
    );

  test
    .do(() => {
      mockDeleteOlderThan.mockRejectedValueOnce(
        doMockAxiosError(
          412,
          'this is a bad request and you should feel bad',
          'BAD_REQUEST'
        )
      );
    })
    .stdout()
    .stderr()
    .command(['source:push:delete', 'mysource', '-d', '12345'])
    .it(
      'returns an information message on deletion failure with older than',
      (ctx) => {
        expect(formatCliLog(ctx.stdout)).toMatchSnapshot();
      }
    );

  test
    .do(() => {
      mockDeleteDocument.mockReturnValueOnce(
        doMockAxiosSuccess(999, 'this document is gone')
      );
    })
    .stdout()
    .stderr()
    .command(['source:push:delete', 'mysource', '-x', 'https://foo.com'])
    .it(
      'returns an information message on successful deletion with document uri',
      (ctx) => {
        expect(formatCliLog(ctx.stdout)).toMatchSnapshot();
      }
    );

  test
    .stdout()
    .stderr()
    .command([
      'source:push:delete',
      'mysource',
      '-x',
      'https://foo.com',
      '-x',
      'https://foo.com/2',
    ])
    .it(
      'returns an information message on successful deletion with multiple document uri',
      (ctx) => {
        expect(formatCliLog(ctx.stdout)).toMatchSnapshot();
      }
    );

  test
    .do(() => {
      mockDeleteDocument.mockRejectedValueOnce(
        doMockAxiosError(
          412,
          'this is a bad request and you should feel bad',
          'BAD_REQUEST'
        )
      );
    })
    .stdout()
    .stderr()
    .command(['source:push:delete', 'mysource', '-x', 'https://foo.com'])
    .it(
      'returns an information message on deletion failure with document uri',
      (ctx) => {
        expect(formatCliLog(ctx.stdout)).toMatchSnapshot();
      }
    );

  test
    .do(() => {
      const err = doMockAxiosError(
        412,
        'this is a bad request and you should feel bad',
        'BAD_REQUEST'
      );
      mockDeleteDocument.mockRejectedValueOnce(err).mockRejectedValueOnce(err);
    })
    .stdout()
    .stderr()
    .command([
      'source:push:delete',
      'mysource',
      '-x',
      'https://foo.com',
      '-x',
      'https://foo.com/2',
    ])
    .it(
      'returns an information message on deletion failure with multiple document uri',
      (ctx) => {
        expect(formatCliLog(ctx.stdout)).toMatchSnapshot();
      }
    );

  test
    .do(() => {
      mockDeleteDocument.mockRejectedValueOnce(
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
      'source:push:delete',
      'mysource',
      '-x',
      'https://foo.com',
      '-x',
      'https://foo.com/2',
    ])
    .it(
      'returns an information message on deletion and success failure with multiple document uri',
      (ctx) => {
        expect(formatCliLog(ctx.stdout)).toMatchSnapshot();
      }
    );

  test
    .stdout()
    .stderr()
    .command([
      'source:push:delete',
      'mysource',
      ...Array(21)
        .fill(null)
        .flatMap((_, index) => ['-x', `https://foo.com/${index}`]),
    ])
    .it(
      'should warn the user when he tries to delete too many items and stop there',
      (ctx) => {
        expect(mockDeleteDocument).not.toBeCalled();
        expect(formatCliLog(ctx.stderr)).toMatchSnapshot();
      }
    );
});
