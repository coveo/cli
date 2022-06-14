jest.mock('../platform/authenticatedClient');

import {Region, ResourceSnapshotsReportType} from '@coveord/platform-client';
import {getDummySnapshotModel} from '../../__stub__/resourceSnapshotsModel.js';
import {getSuccessReport} from '../../__stub__/resourceSnapshotsReportModel.js';
import {Configuration} from '../config/config.js';
import {Snapshot} from './snapshot.js';
import {SnapshotUrlBuilder} from './snapshotUrlBuilder.js';
import {AuthenticatedClient} from '../platform/authenticatedClient.js';
import {PlatformEnvironment} from '../platform/environment.js';
import {fancyIt} from '../../__test__/it.js';
import {CurrentSchemaVersion} from '../config/configSchemaVersion.js';

const createSnapshot = async () => {
  const snapshotID = 'my-snapshot';
  return new Snapshot(
    getDummySnapshotModel('foo', snapshotID, [
      getSuccessReport(snapshotID, ResourceSnapshotsReportType.Apply),
    ]),
    await new AuthenticatedClient().getClient()
  );
};

const getUSProdConfig = (): Configuration => ({
  version: CurrentSchemaVersion,
  region: Region.US,
  environment: PlatformEnvironment.Prod,
  organization: 'does not matter',
  accessToken: 'xxx',
  analyticsEnabled: undefined,
});

const getEUDevConfig = (): Configuration => ({
  version: CurrentSchemaVersion,
  region: Region.EU,
  environment: PlatformEnvironment.Dev,
  organization: 'does not matter',
  accessToken: 'xxx',
  analyticsEnabled: undefined,
});

describe('SnapshotUrlBuilder', () => {
  let snapshotUrlBuilder: SnapshotUrlBuilder;
  let snapshot: Snapshot;

  beforeAll(async () => {
    snapshot = await createSnapshot();
  });

  beforeEach(() => {
    snapshotUrlBuilder = new SnapshotUrlBuilder(getUSProdConfig());
  });

  fancyIt()('#createSnapshotPage should return the snapshot URL', () => {
    expect(snapshotUrlBuilder.getSnapshotApplyPage(snapshot)).toEqual(
      'https://platform.cloud.coveo.com/admin/#foo/organization/resource-snapshots/my-snapshot/apply'
    );
  });

  fancyIt()(
    '#getSynchronizationPage should return the URL to the synchronization page',
    () => {
      snapshotUrlBuilder = new SnapshotUrlBuilder(getUSProdConfig());
      expect(snapshotUrlBuilder.getSynchronizationPage(snapshot)).toEqual(
        'https://platform.cloud.coveo.com/admin/#foo/organization/resource-snapshots/my-snapshot/synchronization'
      );
    }
  );

  fancyIt()(
    '#getSynchronizationPage should return the URL to the synchronization page for Dev',
    () => {
      snapshotUrlBuilder = new SnapshotUrlBuilder(getEUDevConfig());
      expect(snapshotUrlBuilder.getSynchronizationPage(snapshot)).toEqual(
        'https://platformdev-eu.cloud.coveo.com/admin/#foo/organization/resource-snapshots/my-snapshot/synchronization'
      );
    }
  );
});
