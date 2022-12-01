import {CLICommand} from '../command/cliCommand';

export const getFakeCommand = (
  overrideConfig?: Record<string, unknown>
): CLICommand => {
  const fakeCommand = {
    warn: jest.fn(),
    log: jest.fn(),
    parse: jest.fn().mockReturnValue({flags: {}}),
    identifier: 'foo',
    ...overrideConfig,
  };

  return fakeCommand as unknown as CLICommand;
};
