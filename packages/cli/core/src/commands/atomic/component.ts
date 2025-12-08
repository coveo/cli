import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {UnknownError} from '@coveo/cli-commons/errors/unknownError';
import {Flags} from '@oclif/core';
import inquirer from 'inquirer';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {appendCmdIfWindows} from '@coveo/cli-commons/utils/os';
import {spawnProcess} from '../../lib/utils/process';

export default class AtomicInit extends CLICommand {
  public static description =
    'Scaffold a new custom component. Meant to be executed in a component library created using the `coveo atomic:init --lib` command, or in an npm project, or in an empty folder.';
  public static aliases = ['atomic:cmp'];

  public static examples = [
    '<%= config.bin %> <%= command.id %> --type=page myAwesomeComponent',
    '<%= config.bin %> <%= command.id %> --type=result mySuperResultComponent',
  ];

  public static flags = {
    type: Flags.string({
      description: 'The kind of component to initialize.',
      options: ['page', 'result'],
    }),
    version: Flags.string({
      char: 'v',
      description: `The version of @coveo/create-atomic-component or @coveo/create-atomic-result-component to use.`,
      default: 'latest',
    }),
  };

  public static args = [
    {name: 'name', description: 'The name of your component.', required: true},
  ];

  @Trackable()
  public async run(): Promise<void> {
    const {initializer, name} = await this.getSpawnOptions();

    // Security: Validate component name to prevent command injection
    // Component names must be alphanumeric with hyphens only
    if (!/^[a-z0-9-]+$/i.test(name)) {
      this.error(
        'Invalid component name. Component names must contain only letters, numbers, and hyphens.',
        {exit: 1}
      );
    }

    const cliArgs: string[] = [`${initializer}`, `${name}`];
    await spawnProcess(appendCmdIfWindows`npx`, cliArgs);
  }

  private async getSpawnOptions() {
    const {args, flags} = await this.parse(AtomicInit);
    const type = flags.type || (await this.askType());

    const initializerPackage = this.getInitializerPackage(type);

    // TODO CDX-1340: Refactor the replace into a well named utils.
    return {
      initializer: `${initializerPackage}@${flags.version}`,
      name: args.name,
    };
  }

  private async askType(): Promise<string> {
    const responses = await inquirer.prompt([
      {
        name: 'type',
        message: 'What kind of component do you want to scaffold?',
        type: 'list',
        choices: [{name: 'result'}, {name: 'page'}],
      },
    ]);
    return responses.type;
  }

  private getInitializerPackage(type: string): string {
    switch (type) {
      case 'page':
        return '@coveo/create-atomic-component';
      case 'result':
        return '@coveo/create-atomic-result-component';
      default:
        throw new UnknownError();
    }
  }
}
