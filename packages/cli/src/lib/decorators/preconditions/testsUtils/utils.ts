import {Command} from '@oclif/command';

export const getFakeCommand = (
  overrideConfig?: Record<string, unknown>
): Command => {
  const fakeCommand = {
    id: 'foo',
    warn: jest.fn(),
    log: jest.fn(),
    parse: jest.fn().mockReturnValue({flags: {}}),
    ...overrideConfig,
  };

  return fakeCommand as unknown as Command;
};
