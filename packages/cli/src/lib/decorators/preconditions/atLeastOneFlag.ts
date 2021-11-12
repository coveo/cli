import type Command from '@oclif/command';
import {InvalidCommandError} from '../../errors/InvalidCommandError';

export function AtLeastOneFlag() {
  return function (
    _target: Command,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<() => Promise<void>>
  ) {
    const originalCommand = descriptor.value!;
    descriptor.value = async function (this: Command) {
      const {flags} = this.parse(_target.ctor);
      if (Object.entries(flags).length === 0) {
        throw new InvalidCommandError('Command should at least have 1 flag');
      }
      await originalCommand.apply(this);
    };
  };
}
