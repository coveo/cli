jest.mock('../../lib/config/config');

import {BaseConfiguration, Config} from './config';
import {fancyIt} from '../../__test__/it';
import {ConfigRenderer} from './configRenderer';

describe('configRenderer', () => {
  const userFacingConfigKeys: (keyof BaseConfiguration)[] = [
    'organization',
    'region',
  ];
  const mockGet = jest.fn();
  const fakeConfig = {
    get: mockGet,
    userFacingConfigKeys,
  } as unknown as Config;

  const doMockConfig = () => {
    const mockedConfig = jest.mocked(Config);
    mockedConfig.userFacingConfigKeys = userFacingConfigKeys;
  };

  beforeAll(() => {
    doMockConfig();
  });

  fancyIt()('should print the config', (ctx) => {
    mockGet.mockReturnValueOnce({organization: 'bar', region: 'bazz'});
    ConfigRenderer.render(fakeConfig);
    expect(JSON.parse(ctx.stdout)).toMatchObject({
      organization: 'bar',
      region: 'bazz',
    });
  });

  fancyIt()('should not print accessToken', (ctx) => {
    mockGet.mockReturnValueOnce({organization: 'bar', accessToken: 'nonono'});
    ConfigRenderer.render(fakeConfig);
    expect(JSON.parse(ctx.stdout)).toMatchObject({
      organization: 'bar',
    });
  });

  fancyIt()('should only print specified key', (ctx) => {
    mockGet.mockReturnValueOnce({
      organization: 'bar',
      accessToken: 'yesyesyes',
    });
    ConfigRenderer.render(fakeConfig, ['accessToken']);
    expect(JSON.parse(ctx.stdout)).toMatchObject({
      accessToken: 'yesyesyes',
    });
  });
});
