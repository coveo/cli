jest.mock('@coveo/cli-commons/analytics/amplitudeClient');
jest.mock('@coveo/cli-commons/config/globalConfig');

import type {Interfaces} from '@oclif/core';
import globalConfig from '@coveo/cli-commons/config/globalConfig';
import {fancyIt} from '@coveo/cli-commons-dev/testUtils/it';
import {flush} from '@coveo/cli-commons/analytics/amplitudeClient';
import {handleTerminationSignals, exitSignals} from './termination-signals';

type supportedExitSignals = typeof exitSignals[number];

describe('termination-signal', () => {
  const mockedFlush = jest.mocked(flush);
  const mockedGlobalConfig = jest.mocked(globalConfig);
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
    mockedGlobalConfig.get.mockReturnValue({
      configDir: 'the_config_dir',
      runHook: mockedAnalyticHook,
    } as unknown as Interfaces.Config);

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

      fancyIt()('should terminate the process', () => {
        expect(mockExit).toHaveBeenCalled();
      });

      fancyIt()('should send an interruption event', () => {
        expect(mockedAnalyticHook).toHaveBeenCalledWith('analytics', {
          event: {
            event_type: 'interrupted operation',
            event_properties: {
              termination_signal: signal,
            },
          },
        });
      });

      fancyIt()('should flush analytic events', () => {
        expect(mockedFlush).toHaveBeenCalledTimes(1);
      });
    }
  );
});
