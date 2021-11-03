import Command from '@oclif/command';
import {PreconditionError} from '../lib/errors/preconditionError';

const thrower = (reason: string) => {
  throw new PreconditionError(`${reason} Precondition Error`);
};

export const mockPreconditions = <Type extends Record<string, boolean>>(
  preconditionStatus: Type
) => {
  type StatusPromises = Record<
    keyof typeof preconditionStatus,
    (_target: Command) => Promise<void>
  >;

  const keys = Object.keys(preconditionStatus);
  const mockedPreconditions = {} as StatusPromises;

  keys.forEach(
    (key) =>
      (mockedPreconditions[key as keyof Type] = (_target: Command) =>
        new Promise<void>((resolve) =>
          preconditionStatus[key] ? resolve() : thrower(key)
        ))
  );

  return mockedPreconditions;
};
