jest.mock('../../lib/config/config');
jest.mock('../../lib/config/globalConfig');

import {Interfaces, CliUx} from '@oclif/core';
import {Config} from '../../lib/config/config';
import {test} from '@oclif/test';
import globalConfig from '../../lib/config/globalConfig';
const mockedGlobalConfig = jest.mocked(globalConfig);
const mockConfig = jest.mocked(Config);

describe('hooks:prerun', () => {
  const mockGet = jest.fn();
  const mockSet = jest.fn();

  mockConfig.mockImplementation(
    () => ({get: mockGet, set: mockSet} as unknown as Config)
  );

  beforeEach(() => {
    mockedGlobalConfig.get.mockReturnValue({
      configDir: 'the_config_dir',
    } as Interfaces.Config);
  });

  test
    .do(() => {
      mockGet.mockReturnValueOnce({analyticsEnabled: true});
    })
    .stdout()
    .stderr()
    .hook('prerun')
    .it(
      'does not modify config or prompt the user if analytics are enabled in config',
      () => {
        expect(mockSet).not.toHaveBeenCalled();
      }
    );

  test
    .do(() => {
      mockGet.mockReturnValueOnce({analyticsEnabled: undefined});
    })
    .stub(CliUx.ux, 'confirm', () => async () => true)
    .stdout()
    .stderr()
    .hook('prerun', {Command: {id: 'update'}})
    .it(
      'does modify config when #analytics have not been configured and the command being run is update',
      () => {
        expect(mockSet).not.toHaveBeenCalled();
      }
    );

  test
    .do(() => {
      mockGet.mockReturnValueOnce({analyticsEnabled: undefined});
    })
    .stub(CliUx.ux, 'confirm', () => async () => true)
    .stdout()
    .stderr()
    .hook('prerun')
    .it(
      'does modify config when #analytics have not been configured and the users answer #true',
      () => {
        expect(mockSet).toHaveBeenCalledWith('analyticsEnabled', true);
      }
    );

  test
    .do(() => {
      mockGet.mockReturnValueOnce({analyticsEnabled: undefined});
    })
    .stub(CliUx.ux, 'confirm', () => async () => false)
    .stdout()
    .stderr()
    .hook('prerun')
    .it(
      'does modify config when #analytics have not been configured and the users answer #false',
      () => {
        expect(mockSet).toHaveBeenCalledWith('analyticsEnabled', false);
      }
    );
});
