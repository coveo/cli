import { CLICommand } from "../command/cliCommand";

export type DecoratorFunction = (
    target: CLICommand,
    instance?: CLICommand
  ) => Promise<never | void>;
  