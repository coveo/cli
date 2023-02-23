jest.mock('@coveo/cli-commons/preconditions/trackable');
jest.mock('@coveo/cli-commons/config/globalConfig');

import {Interfaces, CliUx} from '@oclif/core';
import {fancyIt} from '@coveo/cli-commons-dev/testUtils/it';
import globalConfig from '@coveo/cli-commons/config/globalConfig';
import {confirmWithAnalytics} from './cli';

const mockedGlobalConfig = jest.mocked(globalConfig);
const mockedAnalyticHook = jest.fn();
const mockedConfirm = jest.fn();
const doMockConfirm = () => {
  Object.defineProperty(cli, 'confirm', {value: mockedConfirm});
};

describe('cli', () => {
  beforeAll(() => {
    mockedGlobalConfig.get.mockReturnValue({
      configDir: 'the_config_dir',
      runHook: mockedAnalyticHook,
    } as unknown as Interfaces.Config);
  });

  beforeEach(() => {
    doMockConfirm();
  });

  afterEach(() => {
    mockedConfirm.mockClear();
  });

  fancyIt()('should call cli.confirm with the right question', async () => {
    await confirmWithAnalytics('this is a question', 'question name');
    expect(mockedConfirm).toHaveBeenCalledWith('this is a question');
  });

  describe('when the user confirmed', () => {
    beforeEach(() => {
      mockedConfirm.mockReturnValue(true);
    });

    fancyIt()('should log a `confirmed` event', async () => {
      await confirmWithAnalytics('question', 'action');
      expect(mockedAnalyticHook).toHaveBeenCalledWith('analytics', {
        event: {
          event_type: 'confirmed action',
          event_properties: {},
        },
      });
    });
  });

  describe('when the user did not confirm', () => {
    beforeEach(() => {
      mockedConfirm.mockReturnValue(false);
    });

    fancyIt()('should log a `cancelled` event', async () => {
      await confirmWithAnalytics('question', 'action');
      expect(mockedAnalyticHook).toHaveBeenCalledWith('analytics', {
        event: {
          event_type: 'cancelled action',
          event_properties: {},
        },
      });
    });
  });
});
