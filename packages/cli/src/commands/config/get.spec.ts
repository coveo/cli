jest.mock('../../lib/config/config');
jest.mock('../../hooks/analytics/analytics');
jest.mock('../../hooks/prerun/prerun');
import {mocked} from 'ts-jest/utils';
import {Config} from '../../lib/config/config';
import {test} from '@oclif/test';
const mockedConfig = mocked(Config);

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
  });

  test
    .do(() => {
      mockGet.mockReturnValueOnce({foo: 'bar', buzz: 'bazz'});
    })
    .stdout()
    .stderr()
    .command(['config:get'])
    .it('prints the config', (ctx) => {
      expect(JSON.parse(ctx.stdout)).toMatchObject({foo: 'bar', buzz: 'bazz'});
    });

  test
    .do(() => {
      mockGet.mockReturnValueOnce({accessToken: 'oh no', foo: 'bar'});
    })
    .stdout()
    .stderr()
    .command(['config:get'])
    .it('prints the config by omitting access token', (ctx) => {
      expect(JSON.parse(ctx.stdout)).not.toHaveProperty('accessToken');
      expect(JSON.parse(ctx.stdout)).toHaveProperty('foo');
    });
});
