import type {IConfig} from '@oclif/config';
import {handleTerminationSignals, signals} from './termination-signals';

type supportedSignals = typeof signals[number];

describe('termination-signal', () => {
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

  it.each([['SIGINT'], ['SIGTERM'], ['SIGQUIT'], ['SIGHUP']])(
    'should terminate the process and send an interruption event',
    async (signal: string) => {
      const signalTuple = (<const>[signal, signal]) as [
        supportedSignals,
        supportedSignals
      ];

      process.emit(...signalTuple);

      expect(mockExit).toHaveBeenCalled();
      expect(mockedAnalyticHook).toHaveBeenCalledWith('analytics', {
        event: {
          event_type: 'interrupted operation',
          event_properties: {
            termination_signal: signal,
          },
        },
      });
    }
  );
});
