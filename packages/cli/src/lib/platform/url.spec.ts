import {Region} from '@coveord/platform-client';
import {mocked} from 'ts-jest/utils';

jest.mock('./environment');
import {PlatformEnvironment, platformUrl} from './environment';
import {snapshotSynchronizationUrl, snapshotUrl} from './url';

describe('url', () => {
  const mockedPlatformUrl = mocked(platformUrl);
  beforeEach(() => {
    mockedPlatformUrl.mockReturnValue('https://foo.test');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('#snapshotUrl', () => {
    it('should build the URL properly', () => {
      expect(
        snapshotUrl('some-org', 'some-snapshot', {
          environment: PlatformEnvironment.QA,
          region: Region.AU,
        })
      ).toBe(
        'https://foo.test/admin/#some-org/organization/resource-snapshots/some-snapshot'
      );

      expect(platformUrl).toBeCalledWith({
        environment: PlatformEnvironment.QA,
        region: Region.AU,
      });
    });
  });

  describe('#snapshotSyncrhonizationUrl', () => {
    it('should build the URL properly', () => {
      expect(
        snapshotSynchronizationUrl('some-org', 'some-snapshot', {
          environment: PlatformEnvironment.QA,
          region: Region.AU,
        })
      ).toBe(
        'https://foo.test/admin/#some-org/organization/resource-snapshots/some-snapshot/synchronization'
      );

      expect(platformUrl).toBeCalledWith({
        environment: PlatformEnvironment.QA,
        region: Region.AU,
      });
    });
  });
});
