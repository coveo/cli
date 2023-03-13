import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Config} from '@coveo/cli-commons/config/config';
import {UnknownError} from '@coveo/cli-commons/errors/unknownError';
import {Preconditions} from '@coveo/cli-commons/preconditions/index';
import {Flags} from '@oclif/core';
import inquirer from 'inquirer';
import {
  atomicAppPreconditions,
  createAtomicApp,
  createAtomicLib,
} from '../../lib/atomic/createAtomicProject';

export default class AtomicInit extends CLICommand {
  public static description =
    'Scaffold a project to work with Coveo Atomic Framework';

  public static examples = [
    '<%= config.bin %> <%= command.id %> --type=app myAwesomeSearchPage',
    '<%= config.bin %> <%= command.id %> --type=lib myCustomAtomicComponentsLibrary',
  ];

  public static flags = {
    type: Flags.string({
      description: 'the kind of project to initialize',
      options: ['app', 'application', 'lib', 'library'],
    }),
  };

  public static args = [
    {name: 'name', description: 'the name of your project', required: true},
  ];

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(AtomicInit);
    const type = flags.type || (await this.askType());

    switch (type) {
      case 'app':
      case 'application':
        await this.createAtomicApp(args.name);
        break;
      case 'lib':
      case 'library':
        await createAtomicLib(args.name);
        break;
      default:
        throw new UnknownError();
    }
  }

  private async askType(): Promise<string> {
    const responses = await inquirer.prompt([
      {
        name: 'type',
        message: 'What kind of project do you want to scaffold?',
        type: 'list',
        choices: [{name: 'application'}, {name: 'library'}],
      },
    ]);
    return responses.type;
  }

  @Preconditions(...atomicAppPreconditions)
  private async createAtomicApp(projectName: string) {
    const cfg = this.configuration.get();
    await createAtomicApp({
      initializerVersion: 'latest',
      projectName,
      cfg,
    });
  }

  private get configuration() {
    return new Config(this.config.configDir);
  }
}
