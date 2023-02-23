import {CLICommand} from '../command/cliCommand';

export const getFakeCommand = (
  overrideConfig?: Record<string, unknown>
): CLICommand => {
  const fakeCommand = {
    warn: jest.fn(),
    log: jest.fn(),
    flags: {},
    parse: jest.fn().mockReturnValue({flags: {}}),
    identifier: 'foo',
    ...overrideConfig,
  };
  Object.assign(fakeCommand, {ctor: fakeCommand});
  return fakeCommand as unknown as CLICommand;
};
