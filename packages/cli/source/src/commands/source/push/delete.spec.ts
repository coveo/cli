jest.mock('@coveo/cli-commons/config/config');
jest.mock('@coveo/cli-commons/preconditions/trackable');

jest.mock('@coveo/cli-commons/platform/authenticatedClient');
jest.mock('@coveo/push-api-client');

import {test} from '@oclif/test';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {PushSource} from '@coveo/push-api-client';
import {
  doMockAxiosError,
  doMockAxiosSuccess,
} from '../../../lib/testsUtils/axiosMocks';
const mockedClient = jest.mocked(AuthenticatedClient);
const mockedSource = jest.mocked(PushSource);

const mockDeleteOlderThan = jest
  .fn()
  .mockReturnValue(Promise.resolve(doMockAxiosSuccess(202, 'tiguidou')));

const mockDeleteDocument = jest
  .fn()
  .mockReturnValue(Promise.resolve(doMockAxiosSuccess(202, 'right trou')));

describe('source:push:delete', () => {
  beforeAll(() => {
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

    mockedSource.mockImplementation(
      () =>
        ({
          deleteDocumentsOlderThan: mockDeleteOlderThan,
          deleteDocument: mockDeleteDocument,
        } as unknown as PushSource)
    );
  });

  beforeEach(() => {
    mockDeleteOlderThan.mockClear();
    mockDeleteDocument.mockClear();
  });

  test
    .stdout()
    .stderr()
    .command(['source:push:delete', 'mysource'])
    .catch(/ou must minimally set the `delete` or the `deleteOlderThan` flag/)
    .it('throws when no flags are specified');

  test
    .stdout()
    .stderr()
    .command(['source:push:delete', 'mysource', '-x', 'foo', '-d', 'bar'])
    .catch(/--delete=foo cannot also be provided when using --deleteOlderThan/)
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
        expect(ctx.stdout).toContain(
          'The delete request for document: older than 12345 was accepted by the Push AP'
        );
        expect(ctx.stdout).toContain('Status code: 999 this document is gone');
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
        expect(ctx.stdout).toContain(
          'Error while trying to delete document: older than 12345'
        );
        expect(ctx.stdout).toContain('Status code: 412');
        expect(ctx.stdout).toContain('Error code: BAD_REQUEST');
        expect(ctx.stdout).toContain(
          'Message: this is a bad request and you should feel bad'
        );
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
        expect(ctx.stdout).toContain(
          'The delete request for document: https://foo.com was accepted by the Push API'
        );
        expect(ctx.stdout).toContain('Status code: 999 this document is gone');
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
        expect(ctx.stdout).toContain(
          'The delete request for document: https://foo.com was accepted by the Push API'
        );
        expect(ctx.stdout).toContain(
          'The delete request for document: https://foo.com/2 was accepted by the Push API'
        );
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
        expect(ctx.stdout).toContain(
          'Error while trying to delete document: https://foo.com'
        );
        expect(ctx.stdout).toContain('Status code: 412');
        expect(ctx.stdout).toContain('Error code: BAD_REQUEST');
        expect(ctx.stdout).toContain(
          'Message: this is a bad request and you should feel bad'
        );
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
        expect(ctx.stdout).toContain(
          'Error while trying to delete document: https://foo.com'
        );
        expect(ctx.stdout).toContain(
          'Error while trying to delete document: https://foo.com/2'
        );
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
        expect(ctx.stdout).toContain(
          'Error while trying to delete document: https://foo.com'
        );
        expect(ctx.stdout).toContain(
          'The delete request for document: https://foo.com/2 was accepted by the Push API'
        );
      }
    );
});
