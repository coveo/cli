import {CLICommand} from '../command/cliCommand';

export type PreconditionFunction = (
  target: CLICommand,
  instance?: CLICommand
) => Promise<never | void>;

export function Preconditions(...preconditions: PreconditionFunction[]) {
  return function (
    target: CLICommand,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalRunCommand = descriptor.value!;
    descriptor.value = async function (this: CLICommand) {
      for (const precondition of preconditions) {
        await precondition.call(this, target);
      }
      return originalRunCommand.apply(this);
    };
  };
}
