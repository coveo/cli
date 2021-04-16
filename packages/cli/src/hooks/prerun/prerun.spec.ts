jest.mock('../../lib/config/config');
import {IConfig} from '@oclif/config';
import {mocked} from 'ts-jest/utils';
import {Config} from '../../lib/config/config';
import {cli} from 'cli-ux';
import {test} from '@oclif/test';
const mockConfig = mocked(Config);

describe('hooks:prerun', () => {
  const mockGet = jest.fn();
  const mockSet = jest.fn();

  mockConfig.mockImplementation(
    () => (({get: mockGet, set: mockSet} as unknown) as Config)
  );

  beforeEach(() => {
    global.config = {configDir: 'the_config_dir'} as IConfig;
  });

  test
    .do(() => {
      mockGet.mockReturnValueOnce(Promise.resolve({analyticsEnabled: true}));
    })
    .stdout()
    .hook('prerun')
    .it(
      'does not modify config or prompt the user if analytics are enabled in config',
      () => {
        expect(mockSet).not.toHaveBeenCalled();
      }
    );

  test
    .do(() => {
      mockGet.mockReturnValueOnce(
        Promise.resolve({analyticsEnabled: undefined})
      );
    })
    .stub(cli, 'confirm', () => async () => true)
    .stdout()
    .hook('prerun', {id: 'update'})
    .it(
      'does modify config when #analytics have not been configured and the command being run is update',
      () => {
        expect(mockSet).not.toHaveBeenCalled();
      }
    );

  test
    .do(() => {
      mockGet.mockReturnValueOnce(
        Promise.resolve({analyticsEnabled: undefined})
      );
    })
    .stub(cli, 'confirm', () => async () => true)
    .stdout()
    .hook('prerun')
    .it(
      'does modify config when #analytics have not been configured and the users answer #true',
      () => {
        expect(mockSet).toHaveBeenCalledWith('analyticsEnabled', true);
      }
    );

  test
    .do(() => {
      mockGet.mockReturnValueOnce(
        Promise.resolve({analyticsEnabled: undefined})
      );
    })
    .stub(cli, 'confirm', () => async () => true)
    .stdout()
    .hook('prerun')
    .it(
      'does modify config when #analytics have not been configured and the users answer #true',
      () => {
        expect(mockSet).toHaveBeenCalledWith('analyticsEnabled', true);
      }
    );

  test
    .do(() => {
      mockGet.mockReturnValueOnce(
        Promise.resolve({analyticsEnabled: undefined})
      );
    })
    .stub(cli, 'confirm', () => async () => false)
    .stdout()
    .hook('prerun')
    .it(
      'does modify config when #analytics have not been configured and the users answer #false',
      () => {
        expect(mockSet).toHaveBeenCalledWith('analyticsEnabled', false);
      }
    );
});
