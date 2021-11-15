import Command from '@oclif/command';
import {fancyIt} from '../../../__test__/it';
import {InvalidCommandError} from '../../errors/InvalidCommandError';
import {AtLeastOneFlag} from './atLeastOneFlag';
import {getFakeCommand} from './testsUtils/utils';

type jestMatcher = jest.JestMatchers<Promise<void>>;

describe('atLeastOneFlag', () => {
  const runDecorator = async (
    fakeCommand: Command,
    fakeDescriptor: {
      value: jest.Mock<Promise<void>>;
    }
  ) => {
    await AtLeastOneFlag()(fakeCommand, '', fakeDescriptor);
    await fakeDescriptor.value.call(fakeCommand);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe.each([
    [
      'flags',
      {flag1: 'pew pew', flag2: 123},
      (x: jestMatcher) => x.resolves.not.toThrow(),
      'should not throw',
    ],
    [
      'no flags',
      {},
      (x: jestMatcher) => x.rejects.toThrow(InvalidCommandError),
      'should throw',
    ],
  ])(
    'when the command has %s',
    (
      _: string,
      flags: Record<string, unknown>,
      expectation: (x: jestMatcher) => Promise<void>,
      message: string
    ) => {
      const fakeOriginalFunction = jest.fn();
      const args = ['argument'];
      let fakeCommand: Command;
      let fakeDescriptor: {
        value: jest.Mock<any, any>;
      };

      beforeEach(async () => {
        fakeCommand = getFakeCommand({
          id: 'foo:bar',
          parse: jest.fn().mockReturnValue({flags, args}),
        });
        fakeDescriptor = {
          value: fakeOriginalFunction,
        };
      });

      fancyIt()(message, async () => {
        const matcher = await expect(runDecorator(fakeCommand, fakeDescriptor));
        expectation(matcher);
      });
    }
  );
});
