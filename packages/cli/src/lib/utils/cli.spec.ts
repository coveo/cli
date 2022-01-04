jest.mock('../../hooks/analytics/analytics');
jest.mock('cli-ux');

import {IConfig} from '@oclif/config';
import {cli} from 'cli-ux';
import {fancyIt} from '../../__test__/it';
import {ProcessAbort} from '../errors/processError';
import {confirm} from './cli';

const mockedAnalyticHook = jest.fn();
const mockedConfirm = jest.fn();
const doMockConfirm = () => {
  Object.defineProperty(cli, 'confirm', {value: mockedConfirm});
};

describe('cli', () => {
  beforeAll(() => {
    global.config = {
      configDir: 'the_config_dir',
      runHook: mockedAnalyticHook,
    } as unknown as IConfig;
  });

  beforeEach(() => {
    doMockConfirm();
  });

  afterEach(() => {
    mockedConfirm.mockClear();
  });

  fancyIt()('should call cli.confirm with the right question', async () => {
    await confirm('this is a question');
    expect(mockedConfirm).toHaveBeenCalledWith('this is a question');
  });

  describe('when the user confirmed', () => {
    beforeEach(() => {
      mockedConfirm.mockReturnValue(true);
    });

    fancyIt()('should log a `confirmed` event', async () => {
      await confirm('question', {eventName: 'event'});
      expect(mockedAnalyticHook).toHaveBeenCalledWith('analytics', {
        event: {
          event_type: 'confirmed event',
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
      await confirm('question', {eventName: 'event'});
      expect(mockedAnalyticHook).toHaveBeenCalledWith('analytics', {
        event: {
          event_type: 'cancelled event',
          event_properties: {},
        },
      });
    });

    describe('when exit option is set to true', () => {
      fancyIt()('should terminate the process', async () => {
        await expect(confirm('question', {exit: true})).rejects.toThrow(
          ProcessAbort
        );
      });
    });

    describe('when exit option is set to false', () => {
      fancyIt()('should not terminate the process', async () => {
        const confirmation = await confirm('question', {exit: false});
        expect(confirmation).toBe(false);
      });
    });

    describe('when exit option is not specified', () => {
      fancyIt()('should not terminate the process', async () => {
        const confirmation = await confirm('question', {exit: false});
        expect(confirmation).toBe(false);
      });
    });
  });
});
