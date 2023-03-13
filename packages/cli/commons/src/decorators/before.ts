import {CLICommand} from '../command/cliCommand';
import { DecoratorFunction } from './decoratorFunction';

export function Before(...preconditions: DecoratorFunction[]) {
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
