import {CLICommand} from '../command/cliCommand';
import {PreconditionError} from '../errors/preconditionError';
import {DecoratorFunction} from '../decorators/decoratorFunction';

const thrower = (reason: string) => {
  throw new PreconditionError(`${reason} Precondition Error`);
};

export const mockPreconditions = <
  PreconditionStatus extends Record<string, boolean>
>(
  preconditionStatus: PreconditionStatus
) => {
  type PreconditionKeys = keyof PreconditionStatus & string;
  type PreconditionPromises = Record<PreconditionKeys, DecoratorFunction>;

  const keys: PreconditionKeys[] = Object.keys(preconditionStatus);
  const mockedPreconditions: Partial<PreconditionPromises> = {};
  for (const key of keys) {
    mockedPreconditions[key] = (_target?: CLICommand) =>
      new Promise<void>((resolve) =>
        preconditionStatus[key] ? resolve() : thrower(key)
      );
  }

  return mockedPreconditions as PreconditionPromises;
};
