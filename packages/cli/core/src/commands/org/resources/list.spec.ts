jest.mock('@coveo/cli-commons/config/config');
jest.mock('@coveo/cli-commons/preconditions/trackable');

jest.mock('@coveo/cli-commons/platform/authenticatedClient');

import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {test} from '@oclif/test';
import {ResourceSnapshotsModel} from '@coveo/platform-client';
import {Config} from '@coveo/cli-commons/config/config';

const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
const mockedConfig = jest.mocked(Config);

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
      expect(ctx.stdout).toMatchSnapshot();
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:list', '-o', 'foo', '--no-header'])
    .it('print the available snapshot in a table without header', (ctx) => {
      expect(ctx.stdout).toMatchSnapshot();
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:list', '-o', 'foo', '--output=json'])
    .it('print the available snapshot in a JSON format', (ctx) => {
      expect(ctx.stdout).toMatchSnapshot();
    });
});
