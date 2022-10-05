jest.mock('@coveo/cli-commons/platform/authenticatedClient');

import {Region, ResourceSnapshotsReportType} from '@coveo/platform-client';
import {getDummySnapshotModel} from '../../__stub__/resourceSnapshotsModel';
import {getSuccessReport} from '../../__stub__/resourceSnapshotsReportModel';
import {Configuration} from '@coveo/cli-commons/config/config';
import {Snapshot} from './snapshot';
import {SnapshotUrlBuilder} from './snapshotUrlBuilder';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {PlatformEnvironment} from '@coveo/cli-commons/platform/environment';
import {fancyIt} from '@coveo/cli-commons-dev/testUtils/it';
import {CurrentSchemaVersion} from '@coveo/cli-commons/config/configSchemaVersion';

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
