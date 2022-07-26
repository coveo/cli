jest.mock('../platform/authenticatedClient');

import {Region, ResourceSnapshotsReportType} from '@coveord/platform-client';
import {getDummySnapshotModel} from '../../__stub__/resourceSnapshotsModel';
import {getSuccessReport} from '../../__stub__/resourceSnapshotsReportModel';
import {Configuration} from '../config/config';
import {Snapshot} from './snapshot';
import {SnapshotUrlBuilder} from './snapshotUrlBuilder';
import {AuthenticatedClient} from '../platform/authenticatedClient';
import {PlatformEnvironment} from '../platform/environment';
import {fancyIt} from '../../__test__/it';
import {CurrentSchemaVersion} from '../config/configSchemaVersion';

const createSnapshot = async () => {
  const snapshotID = 'my-snapshot';
  return new Snapshot(
    getDummySnapshotModel('foo', snapshotID, {
      reports: [
        getSuccessReport(snapshotID, ResourceSnapshotsReportType.Apply),
      ],
    }),
    await new AuthenticatedClient().getClient()
  );
};

const getUSProdConfig = (): Configuration => ({
  version: CurrentSchemaVersion,
  region: Region.US,
  environment: PlatformEnvironment.Prod,
  organization: 'does not matter',
  accessToken: 'xxx',
});

const getEUDevConfig = (): Configuration => ({
  version: CurrentSchemaVersion,
  region: Region.EU,
  environment: PlatformEnvironment.Dev,
  organization: 'does not matter',
  accessToken: 'xxx',
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
});
