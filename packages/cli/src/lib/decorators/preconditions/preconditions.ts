import type Command from '@oclif/command';

export type PreconditionFunction = (
  target: Command
) => Boolean | Promise<Boolean>;

export function Preconditions(...preconditions: PreconditionFunction[]) {
  return function (
    target: Command,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<() => Promise<void>>
  ) {
    const originalRunCommand = descriptor.value!;
    descriptor.value = async function () {
      for (const precondition of preconditions) {
        if (!(await precondition(target))) {
          return;
        }
      }
      await originalRunCommand.apply(this);
    };
  };
}
