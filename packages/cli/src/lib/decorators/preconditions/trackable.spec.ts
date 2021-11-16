import {fancyIt} from '../../../__test__/it';
import {getFakeCommand} from './testsUtils/utils';
import {Trackable} from './trackable';

describe('trackable', () => {
  const mockedAnalyticHook = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when the command successfully completes', () => {
    const fakeOriginalFunction = jest.fn();

    beforeEach(async () => {
      const args = ['argument'];
      const flags = {
        stringFlag: 'power level is over',
        numberFlag: 9000,
      };
      const mockedConfig = {
        runHook: mockedAnalyticHook,
      };
      const fakeCommand = getFakeCommand({
        id: 'foo:bar',
        config: mockedConfig,
        parse: jest.fn().mockReturnValue({flags, args}),
      });
      const fakeDescriptor = {
        value: fakeOriginalFunction,
      };
      await Trackable()(fakeCommand, '', fakeDescriptor);
      await fakeDescriptor.value.call(fakeCommand);
    });

    fancyIt()('should track run the original function', () => {
      expect(fakeOriginalFunction).toHaveBeenCalledTimes(1);
    });

    fancyIt()('should trigger 2 analytic hooks', () => {
      expect(mockedAnalyticHook).toHaveBeenCalledTimes(2);
    });

    fancyIt()('should properly format events', () => {
      const event = {
        event_properties: {
          command: 'foo:bar',
        },
      };
      expect(mockedAnalyticHook).toHaveBeenNthCalledWith(1, 'analytics', {
        event: {...event, ...{event_type: 'started foo bar'}},
        identify: true,
      });
      expect(mockedAnalyticHook).toHaveBeenNthCalledWith(2, 'analytics', {
        event: {...event, ...{event_type: 'completed foo bar'}},
      });
    });
  });

  describe('when the command throws an error', () => {
    const fakeOriginalFunction = jest.fn();

    beforeEach(async () => {
      const args = ['argument'];
      const flags = {
        stringFlag: 'power level is over',
        numberFlag: 9000,
      };
      const mockedConfig = {
        runHook: mockedAnalyticHook,
      };
      const fakeCommand = getFakeCommand({
        id: 'foo:bar',
        config: mockedConfig,
        parse: jest.fn().mockReturnValue({flags, args}),
      });
      const fakeDescriptor = {
        value: fakeOriginalFunction,
      };
      const error = new Error('Some kind of error');
      await Trackable()(fakeCommand, '', fakeDescriptor);
      await fakeDescriptor.value.call(fakeCommand, error);
    });

    fancyIt()('should track run the original function', async () => {
      expect(fakeOriginalFunction).toHaveBeenCalledTimes(1);
    });

    fancyIt()('should trigger one analytic hook', () => {
      expect(mockedAnalyticHook).toHaveBeenCalledTimes(1);
    });

    fancyIt()('should properly format events', () => {
      const event = {
        event_properties: {
          error_type: 'Unknown CLI Error',
          command: 'foo:bar',
        },
      };

      expect(mockedAnalyticHook).toHaveBeenNthCalledWith(1, 'analytics', {
        event: {...event, ...{event_type: 'received error'}},
      });
    });
  });
});
