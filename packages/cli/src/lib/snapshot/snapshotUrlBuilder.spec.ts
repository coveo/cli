jest.mock('../platform/authenticatedClient');

import {Region, ResourceSnapshotsReportType} from '@coveord/platform-client';
import {getDummySnapshotModel} from '../../__stub__/resourceSnapshotsModel';
import {getSuccessReport} from '../../__stub__/resourceSnapshotsReportModel';
import {Config, Configuration} from '../config/config';
import {Snapshot} from './snapshot';
import {SnapshotUrlBuilder} from './snapshotUrlBuilder';
import {AuthenticatedClient} from '../platform/authenticatedClient';
import {PlatformEnvironment} from '../platform/environment';

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
  version: Config.CurrentSchemaVersion,
  region: Region.US,
  environment: PlatformEnvironment.Prod,
  organization: 'does not matter',
  accessToken: 'xxx',
  analyticsEnabled: undefined,
});

const getEUDevConfig = (): Configuration => ({
  version: Config.CurrentSchemaVersion,
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

  it('#createSnapshotPage should return the snapshot URL', () => {
    expect(snapshotUrlBuilder.getSnapshotPage(snapshot)).toEqual(
      'https://platform.cloud.coveo.com/admin/#foo/organization/resource-snapshots/my-snapshot'
    );
  });

  it('#getSynchronizationPage should return the URL to the synchronization page', () => {
    snapshotUrlBuilder = new SnapshotUrlBuilder(getUSProdConfig());
    expect(snapshotUrlBuilder.getSynchronizationPage(snapshot)).toEqual(
      'https://platform.cloud.coveo.com/admin/#foo/organization/resource-snapshots/my-snapshot/synchronization'
    );
  });

  it('#getSynchronizationPage should return the URL to the synchronization page for Dev', () => {
    snapshotUrlBuilder = new SnapshotUrlBuilder(getEUDevConfig());
    expect(snapshotUrlBuilder.getSynchronizationPage(snapshot)).toEqual(
      'https://platformdev-eu.cloud.coveo.com/admin/#foo/organization/resource-snapshots/my-snapshot/synchronization'
    );
  });
});
