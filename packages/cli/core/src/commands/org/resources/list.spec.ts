jest.mock('@coveo/cli-commons/config/config');
jest.mock('@coveo/cli-commons/preconditions/trackable');
jest.mock('@coveo/cli-commons/preconditions/authenticated');

jest.mock('@coveo/cli-commons/platform/authenticatedClient');

import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {test} from '@oclif/test';
import {ResourceSnapshotsModel} from '@coveo/platform-client';
import {Config} from '@coveo/cli-commons/config/config';
import {IsAuthenticated} from '@coveo/cli-commons/preconditions';
import {mockPreconditions} from '@coveo/cli-commons/preconditions/mockPreconditions';

const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
const mockedConfig = jest.mocked(Config);
const mockedIsAuthenticated = jest.mocked(IsAuthenticated);

const doMockPreconditions = function () {
  const preconditionStatus = {
    authentication: true,
  };
  const mockedPreconditions = mockPreconditions(preconditionStatus);
  mockedIsAuthenticated.mockReturnValue(mockedPreconditions.authentication);
};

const mockResourceSnapshotModel: () => ResourceSnapshotsModel = () => ({
  createdBy: 'bob',
  createdDate: Date.now(),
  id: 'id',
  targetId: 'targetId',
  contentSummary: {foo: 1, bar: 2},
  developerNote: 'some notes',
  originId: 'originId',
  reports: [],
  synchronizationReports: [],
});

const mockListSnapshots = jest
  .fn()
  .mockReturnValue(Promise.resolve([mockResourceSnapshotModel()]));

describe('org:resources:list', () => {
  beforeAll(() => {
    doMockPreconditions();
    mockedAuthenticatedClient.mockImplementation(
      () =>
        ({
          getClient: () =>
            Promise.resolve({resourceSnapshot: {list: mockListSnapshots}}),
        } as unknown as AuthenticatedClient)
    );
    mockedConfig.mockImplementation(
      () =>
        ({
          get: {
            organization: 'foo',
          },
        } as unknown as Config)
    );
  });

  test
    .do(() => {
      mockListSnapshots.mockReturnValueOnce(Promise.resolve([]));
    })
    .stdout()
    .stderr()
    .command(['org:resources:list', '-o', 'foo'])
    .it('works when there is no snapshot available', (ctx) => {
      expect(ctx.stdout).toContain(
        'There is no configuration snapshot available in organization foo'
      );
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:list', '-o', 'foo'])
    .it('print the available snapshot in a table', (ctx) => {
      // headers of table
      expect(ctx.stdout).toContain('Id');
      expect(ctx.stdout).toContain('Created by');
      expect(ctx.stdout).toContain('Created date');
      expect(ctx.stdout).toContain('Target id');
      expect(ctx.stdout).toContain('Developer note');

      // values of table
      expect(ctx.stdout).toContain('id');
      expect(ctx.stdout).toContain('bob');
      expect(ctx.stdout).toContain('targetId');
      expect(ctx.stdout).toContain('some notes');
    });
});
