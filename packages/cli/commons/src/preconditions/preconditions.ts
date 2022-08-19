import type {Command} from '@oclif/core';

export type PreconditionFunction = (
  target: Command,
  instance?: Command
) => Promise<never | void>;

export function Preconditions(...preconditions: PreconditionFunction[]) {
  return function (
    target: Command,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<() => Promise<void>>
  ) {
    const originalRunCommand = descriptor.value!;
    descriptor.value = async function (this: Command) {
      for (const precondition of preconditions) {
        await precondition.call(this, target);
      }
      await originalRunCommand.apply(this);
    };
  };
}
