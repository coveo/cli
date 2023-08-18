jest.mock('@coveo/cli-commons/preconditions/trackable');
jest.mock('@coveo/cli-commons/config/globalConfig');
jest.mock('@coveo/cli-commons/utils/ux');

import {Interfaces} from '@oclif/core';
import {confirm} from '@coveo/cli-commons/utils/ux';
import {fancyIt} from '@coveo/cli-commons-dev/testUtils/it';
import globalConfig from '@coveo/cli-commons/config/globalConfig';
import {confirmWithAnalytics} from './cli';

const mockedGlobalConfig = jest.mocked(globalConfig);
const mockedAnalyticHook = jest.fn();

describe('cli', () => {
  const mockedConfirm = jest.mocked(confirm);
  beforeAll(() => {
    mockedGlobalConfig.get.mockReturnValue({
      configDir: 'the_config_dir',
      runHook: mockedAnalyticHook,
    } as unknown as Interfaces.Config);
  });

  afterEach(() => {
    mockedConfirm.mockReset();
  });

  fancyIt()('should call cli.confirm with the right question', async () => {
    await confirmWithAnalytics('this is a question', 'question name');
    expect(mockedConfirm).toHaveBeenCalledWith('this is a question', false);
  });

  describe('when the user confirmed', () => {
    beforeEach(() => {
      mockedConfirm.mockResolvedValue(true);
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
      mockedConfirm.mockResolvedValue(false);
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
