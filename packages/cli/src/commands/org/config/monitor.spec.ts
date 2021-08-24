jest.mock('../../../lib/config/config');
jest.mock('../../../hooks/analytics/analytics');
jest.mock('../../../hooks/prerun/prerun');
jest.mock('../../../lib/platform/authenticatedClient');

import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {Config} from '../../../lib/config/config';
import {mocked} from 'ts-jest/utils';
import {ResourceSnapshotsReportType} from '@coveord/platform-client';
import {test} from '@oclif/test';
import {getDummySnapshotModel} from '../../../__stub__/resourceSnapshotsModel';
import {getSuccessReport} from '../../../__stub__/resourceSnapshotsReportModel';

const mockedAuthenticatedClient = mocked(AuthenticatedClient, true);
const mockedConfig = mocked(Config);
const mockedConfigGet = jest.fn();
const mockedGetClient = jest.fn();
const mockedGetSnapshot = jest.fn();

const doMockConfig = () => {
  mockedConfigGet.mockReturnValue(
    Promise.resolve({
      region: 'us',
      organization: 'default-org',
      environment: 'prod',
    })
  );

  mockedConfig.mockImplementation(
    () =>
      ({
        get: mockedConfigGet,
      } as unknown as Config)
  );
};

const doMockAuthenticatedClient = () => {
  mockedGetClient.mockImplementation(() =>
    Promise.resolve({
      resourceSnapshot: {
        get: mockedGetSnapshot,
      },
    })
  );

  mockedAuthenticatedClient.prototype.getClient.mockImplementation(
    mockedGetClient
  );
};

describe('org:config:monitor', () => {
  beforeAll(() => {
    doMockConfig();
    doMockAuthenticatedClient();

    mockedGetSnapshot.mockResolvedValue(
      getDummySnapshotModel('default-org', 'my-snapshot', [
        getSuccessReport('my-snapshot', ResourceSnapshotsReportType.Apply),
      ])
    );
  });

  test
    .command(['org:config:monitor'])
    .catch((ctx) => {
      expect(ctx.message).toContain('Missing 1 required arg:');
    })
    .it('requires snapshotId name argument');

  test
    .command(['org:config:monitor', 'my-snapshot'])
    .it('should work with default connected org', () => {
      expect(mockedGetClient).toHaveBeenCalledWith({
        organization: 'default-org',
      });
    });

  test
    .command(['org:config:monitor', 'other-snapshot', '-t', 'different-org'])
    .it('should work with default connected org', () => {
      expect(mockedGetClient).toHaveBeenCalledWith({
        organization: 'different-org',
      });
    });
});
