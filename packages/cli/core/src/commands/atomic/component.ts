import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Before} from '@coveo/cli-commons/decorators/before';
import {Beta} from '@coveo/cli-commons/decorators/beta';
import {UnknownError} from '@coveo/cli-commons/errors/unknownError';
import {Flags} from '@oclif/core';
import inquirer from 'inquirer';
import {appendCmdIfWindows} from '../../lib/utils/os';
import {spawnProcess} from '../../lib/utils/process';
import {startSpinner} from '@coveo/cli-commons/utils/ux';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';

export default class AtomicInit extends CLICommand {
  public static description =
    'Scaffold a new custom component in your Coveo Atomic Component Library';
  public static aliases = ['atomic:cmp'];

  public static examples = [
    '<%= config.bin %> <%= command.id %> --type=page myAwesomeComponent',
    '<%= config.bin %> <%= command.id %> --type=result mySuperResultComponent',
  ];

  public static flags = {
    type: Flags.string({
      description: 'the kind of component to initialize',
      options: ['page', 'result'],
    }),
  };

  public static args = [
    {name: 'name', description: 'the name of your component', required: true},
  ];

  @Before(Beta())
  @Trackable()
  public async run(): Promise<void> {
    const {initializer, name} = await this.getSpawnOptions();

    const cliArgs = ['init', initializer, name];
    startSpinner('Scaffolding project');
    await spawnProcess(appendCmdIfWindows`npm`, cliArgs);
  }

  private async getSpawnOptions() {
    const {args, flags} = await this.parse(AtomicInit);
    const type = flags.type || (await this.askType());

    const initializer = this.getInitializerPackage(type);
    return {initializer, name: args.name};
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
        return '@coveo/atomic-component';
      case 'result':
        return '@coveo/atomic-result-component';
      default:
        throw new UnknownError();
    }
  }
}
