jest.mock('@coveo/cli-commons/src/config/config');
jest.mock('@coveo/cli-commons/src/preconditions/trackable');

import {Config} from '@coveo/cli-commons/src/config/config';
import {test} from '@oclif/test';
const mockedConfig = jest.mocked(Config, true);

describe('config:get', () => {
  const mockGet = jest.fn();
  const mockSet = jest.fn();

  beforeEach(() => {
    mockedConfig.mockImplementation(
      () =>
        ({
          get: mockGet,
          set: mockSet,
        } as unknown as Config)
    );
    mockedConfig.userFacingConfigKeys = ['organization', 'region'];
  });

  test
    .do(() => {
      mockGet.mockReturnValueOnce({organization: 'bar', region: 'bazz'});
    })
    .stdout()
    .stderr()
    .command(['config:get'])
    .it('prints the config', (ctx) => {
      expect(JSON.parse(ctx.stdout)).toMatchObject({
        organization: 'bar',
        region: 'bazz',
      });
    });

  test
    .do(() => {
      mockGet.mockReturnValueOnce({organization: 'bar', region: 'bazz'});
    })
    .stdout()
    .stderr()
    .command(['config:get', 'organization'])
    .it('prints the config value for a specific key', (ctx) => {
      expect(JSON.parse(ctx.stdout)).not.toHaveProperty('region');
      expect(JSON.parse(ctx.stdout)).toHaveProperty('organization');
    });

  test
    .do(() => {
      mockGet.mockReturnValueOnce({
        accessToken: 'oh no',
        organization: 'bar',
      });
    })
    .stdout()
    .stderr()
    .command(['config:get'])
    .it('prints the config by omitting access token', (ctx) => {
      expect(JSON.parse(ctx.stdout)).not.toHaveProperty('accessToken');
      expect(JSON.parse(ctx.stdout)).toHaveProperty('organization');
    });
});