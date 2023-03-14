import {CLICommand} from '../command/cliCommand';
import {DecoratorFunction} from './decoratorFunction';

export function Beta(): DecoratorFunction {
  return async function (target: CLICommand) {
    target.warn(
      `${target.identifier} is in beta, please report issue on https://github.com/coveo/cli/issues`
    );
  };
}
