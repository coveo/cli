import {
  snapshotSynchronizationUrl,
  snapshotUrl,
  SnapshotUrlOptionsArgs,
} from './url';

describe('url', () => {
  const getSnapshotUrlOptions = (): SnapshotUrlOptionsArgs => {
    return {
      environment: 'prod',
      targetOrgId: 'foo',
      snapshotId: 'bar',
    };
  };

  it('#snapshotUrl should return the url to the snapshot page', () => {
    const options = getSnapshotUrlOptions();
    expect(snapshotUrl(options)).toEqual(
      'https://platform.cloud.coveo.com/admin/#foo/organization/resource-snapshots/bar'
    );
  });

  it('#snapshotSynchronizationUrl should return the url to the snapshot synchronization page', () => {
    const options = getSnapshotUrlOptions();
    expect(snapshotSynchronizationUrl(options)).toEqual(
      'https://platform.cloud.coveo.com/admin/#foo/organization/resource-snapshots/bar/synchronization'
    );
  });
});
