import {PlatformUrlOptions} from './environment';
import {snapshotSynchronizationUrl, snapshotUrl} from './url';

describe('url', () => {
  const targetOrgId = 'foo';
  const snapshotId = 'bar';

  describe('when the region is us-west-2', () => {
    const options: PlatformUrlOptions = {
      environment: 'prod',
      region: 'us-west-2',
    };

    it('#snapshotUrl should return the url to the snapshot page', () => {
      expect(snapshotUrl(targetOrgId, snapshotId, options)).toEqual(
        'https://platform-us-west-2.cloud.coveo.com/admin/#foo/organization/resource-snapshots/bar'
      );
    });

    it('#snapshotSynchronizationUrl should return the url to the snapshot synchronization page', () => {
      expect(
        snapshotSynchronizationUrl(targetOrgId, snapshotId, options)
      ).toEqual(
        'https://platform-us-west-2.cloud.coveo.com/admin/#foo/organization/resource-snapshots/bar/synchronization'
      );
    });
  });

  describe('when the environment is dev', () => {
    const options: PlatformUrlOptions = {
      environment: 'dev',
      region: 'us-east-1',
    };

    it('#snapshotUrl should return the url to the snapshot page', () => {
      expect(snapshotUrl(targetOrgId, snapshotId, options)).toEqual(
        'https://platformdev.cloud.coveo.com/admin/#foo/organization/resource-snapshots/bar'
      );
    });

    it('#snapshotSynchronizationUrl should return the url to the snapshot synchronization page', () => {
      expect(
        snapshotSynchronizationUrl(targetOrgId, snapshotId, options)
      ).toEqual(
        'https://platformdev.cloud.coveo.com/admin/#foo/organization/resource-snapshots/bar/synchronization'
      );
    });
  });
});
