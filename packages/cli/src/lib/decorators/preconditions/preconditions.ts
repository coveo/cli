import type Command from '@oclif/command';

export type PreconditionFunction = (
  target: Command,
  instance?: Command
) => Boolean | Promise<Boolean>;

export function Preconditions(...preconditions: PreconditionFunction[]) {
  return function (
    target: Command,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<() => Promise<void>>
  ) {
    const originalRunCommand = descriptor.value!;
    descriptor.value = async function (this: Command) {
      for (const precondition of preconditions) {
        if (!(await precondition.call(this, target))) {
          return;
        }
      }
      await originalRunCommand.apply(this);
    };
  };
}
