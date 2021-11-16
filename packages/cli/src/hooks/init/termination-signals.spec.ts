jest.mock('../analytics/analytics');

import type {IConfig} from '@oclif/config';
import {mocked} from 'ts-jest/utils';
import {fancyIt} from '../../__test__/it';
import {flush} from '../analytics/analytics';
import {handleTerminationSignals, exitSignals} from './termination-signals';

type supportedExitSignals = typeof exitSignals[number];

describe('termination-signal', () => {
  const mockedFlush = mocked(flush);
  const emit = (signal: string) => {
    const signalTuple = (<const>[signal, signal]) as [
      supportedExitSignals,
      supportedExitSignals
    ];

    process.emit(...signalTuple);
  };
  const flushPromises = () => new Promise(setImmediate);
  const mockedAnalyticHook = jest.fn();
  const mockExit = jest
    .spyOn(process, 'exit')
    .mockImplementation(() => ({} as unknown as never));

  beforeAll(() => {
    global.config = {
      configDir: 'the_config_dir',
      runHook: mockedAnalyticHook,
    } as unknown as IConfig;
    handleTerminationSignals();
  });

  afterAll(() => {
    mockExit.mockRestore();
  });

  describe.each([['SIGINT'], ['SIGTERM'], ['SIGQUIT'], ['SIGHUP']])(
    'when a %s event is fired',
    (signal: string) => {
      beforeEach(async () => {
        emit(signal);
        await flushPromises();
      });

      fancyIt()('should terminate the process', async () => {
        expect(mockExit).toHaveBeenCalled();
      });

      fancyIt()('should send an interruption event', async () => {
        expect(mockedAnalyticHook).toHaveBeenCalledWith('analytics', {
          event: {
            event_type: 'interrupted operation',
            event_properties: {
              termination_signal: signal,
            },
          },
        });
      });

      fancyIt()('should flush analytic events', async () => {
        expect(mockedFlush).toHaveBeenCalledTimes(1);
      });
    }
  );
});
