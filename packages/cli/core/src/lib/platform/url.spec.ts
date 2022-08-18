import {Region} from '@coveord/platform-client';
import {fancyIt} from '../../__test__/it';

jest.mock('./environment');
import {PlatformEnvironment, platformUrl} from './environment';
import {createSnapshotUrl, snapshotApplyUrl, snapshotUrl} from './url';

describe('url', () => {
  const mockedPlatformUrl = jest.mocked(platformUrl);
  beforeEach(() => {
    mockedPlatformUrl.mockReturnValue('https://foo.test');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('#snapshotUrl', () => {
    fancyIt()('should build the URL properly', () => {
      expect(
        snapshotUrl('some-org', 'some-snapshot', {
          environment: PlatformEnvironment.Stg,
          region: Region.AU,
        })
      ).toBe(
        'https://foo.test/admin/#some-org/organization/resource-snapshots/some-snapshot'
      );

      expect(platformUrl).toBeCalledWith({
        environment: PlatformEnvironment.Stg,
        region: Region.AU,
      });
    });
  });

  describe('#snapshotApplyUrl', () => {
    fancyIt()('should build the URL properly', () => {
      expect(
        snapshotApplyUrl('some-org', 'some-snapshot', {
          environment: PlatformEnvironment.Stg,
          region: Region.AU,
        })
      ).toBe(
        'https://foo.test/admin/#some-org/organization/resource-snapshots/some-snapshot/apply'
      );

      expect(platformUrl).toBeCalledWith({
        environment: PlatformEnvironment.Stg,
        region: Region.AU,
      });
    });
  });

  describe('#createSnapshotUrl', () => {
    fancyIt()('should build the URL properly', () => {
      expect(
        createSnapshotUrl('some-org', {
          environment: PlatformEnvironment.Stg,
          region: Region.AU,
        })
      ).toBe(
        'https://foo.test/admin/#some-org/organization/resource-snapshots/create-snapshot'
      );

      expect(platformUrl).toBeCalledWith({
        environment: PlatformEnvironment.Stg,
        region: Region.AU,
      });
    });
  });
});
