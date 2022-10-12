jest.mock('@coveo/cli-commons/config/config');
jest.mock('@coveo/cli-commons/preconditions/trackable');
jest.mock('@coveo/cli-commons/platform/authenticatedClient');
jest.mock('open');

import {Region} from '@coveo/platform-client';
import test from '@oclif/test';
import open from 'open';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {
  DEFAULT_ENVIRONMENT,
  DEFAULT_REGION,
  PlatformEnvironment,
} from '@coveo/cli-commons/platform/environment';

const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
const mockedConfig = jest.fn();
const mockedOpen = jest.mocked(open);

const mockAuthenticatedClient = () => {
  mockedAuthenticatedClient.mockImplementation(
    () =>
      ({
        cfg: {
          get: mockedConfig,
        },
      } as unknown as AuthenticatedClient)
  );
};

const mockConfigWithDefaultEnvironment = () => {
  mockedConfig.mockReturnValue({
    organization: 'my-org',
    environment: DEFAULT_ENVIRONMENT,
    region: DEFAULT_REGION,
  });
};

const mockConfigWithNonDefaultEnvironment = () => {
  mockedConfig.mockReturnValue({
    organization: 'my-org',
    environment: PlatformEnvironment.Dev,
    region: Region.EU,
  });
};

describe('org:resources:model:create', () => {
  beforeEach(() => {
    mockAuthenticatedClient();
  });

  afterEach(() => {
    mockedAuthenticatedClient.mockClear();
  });

  describe.each([
    [
      'using default configuration',
      mockConfigWithDefaultEnvironment,
      'https://platform.cloud.coveo.com/admin/#/my-org/organization/resource-snapshots/create-snapshot',
    ],
    [
      'using non-default configuration',
      mockConfigWithNonDefaultEnvironment,
      'https://platformdev-eu.cloud.coveo.com/admin/#/my-org/organization/resource-snapshots/create-snapshot',
    ],
  ])(
    'when %s.',
    (_description: string, mockConfig: () => void, expectedUrl: string) => {
      test
        .stdout()
        .stderr()
        .do(() => {
          mockConfig();
        })
        .command(['org:resources:model:create'])
        .it('should open the platform url', () => {
          expect(mockedOpen).toHaveBeenCalledWith(expectedUrl);
        });
    }
  );
});
