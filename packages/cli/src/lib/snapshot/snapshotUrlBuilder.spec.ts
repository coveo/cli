jest.mock('../platform/authenticatedClient');

import {ResourceSnapshotsReportType} from '@coveord/platform-client';
import {getDummySnapshotModel} from '../../__stub__/resourceSnapshotsModel';
import {getSuccessReport} from '../../__stub__/resourceSnapshotsReportModel';
import {Configuration} from '../config/config';
import {Snapshot} from './snapshot';
import {SnapshotUrlBuilder} from './snapshotUrlBuilder';
import {AuthenticatedClient} from '../platform/authenticatedClient';

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
  region: 'us-east-1',
  environment: 'prod',
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

  it('#createSnapshotPage should return the snapshot URL', () => {
    snapshotUrlBuilder = new SnapshotUrlBuilder(getUSProdConfig());
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
});
