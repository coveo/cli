jest.mock('../../../../lib/config/config');
jest.mock('../../../../hooks/analytics/analytics');
jest.mock('../../../../hooks/prerun/prerun');
jest.mock('../../../../lib/platform/authenticatedClient');
jest.mock('open');

import test from '@oclif/test';
import open from 'open';
import {mocked} from 'ts-jest/utils';
import {AuthenticatedClient} from '../../../../lib/platform/authenticatedClient';
import {
  DEFAULT_ENVIRONMENT,
  DEFAULT_REGION,
} from '../../../../lib/platform/environment';

const mockedAuthenticatedClient = mocked(AuthenticatedClient);
const mockedConfig = jest.fn();
const mockedOpen = mocked(open);

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
  mockedConfig.mockResolvedValue({
    organization: 'my-org',
    environment: DEFAULT_ENVIRONMENT,
    region: DEFAULT_REGION,
  });
};

const mockConfigWithNonDefaultEnvironment = () => {
  mockedConfig.mockResolvedValue({
    organization: 'my-org',
    environment: 'dev',
    region: 'eu',
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
      'https://platform.cloud.coveo.com/admin/#my-org/organization/resource-snapshots/create-snapshot',
    ],
    [
      'using non-default configuration',
      mockConfigWithNonDefaultEnvironment,
      'https://platformdev-eu.cloud.coveo.com/admin/#my-org/organization/resource-snapshots/create-snapshot',
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
