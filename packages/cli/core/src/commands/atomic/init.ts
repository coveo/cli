import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Config} from '@coveo/cli-commons/config/config';
import {Before} from '@coveo/cli-commons/decorators/before';
import {UnknownError} from '@coveo/cli-commons/errors/unknownError';
import {Flags} from '@oclif/core';
import inquirer from 'inquirer';
import {
  atomicAppPreconditions,
  atomicLibPreconditions,
  createAtomicApp,
  createAtomicLib,
} from '../../lib/atomic/createAtomicProject';
import {promptForSearchHub} from '../ui/create/shared';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';

export default class AtomicInit extends CLICommand {
  public static description =
    'Scaffold a project to work with the Coveo Atomic Framework.';

  public static examples = [
    '<%= config.bin %> <%= command.id %> --type=app myAwesomeSearchPage',
    '<%= config.bin %> <%= command.id %> --type=lib myCustomAtomicComponentsLibrary',
  ];

  public static flags = {
    type: Flags.string({
      description:
        'The kind of project to initialize. Use `app`/`application` to start a new Atomic search page project, and `lib`/`library` to start a custom component library.',
      options: ['app', 'application', 'lib', 'library'],
    }),
  };

  public static args = [
    {name: 'name', description: 'The name of your project.', required: true},
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
        await this.createAtomicLib(args.name);
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

  @Before(...atomicLibPreconditions)
  private createAtomicLib(projectName: string) {
    return createAtomicLib({projectName});
  }

  @Before(...atomicAppPreconditions)
  private async createAtomicApp(projectName: string) {
    const cfg = this.configuration.get();
    return createAtomicApp({
      projectName,
      cfg,
    });
  }

  private get configuration() {
    return new Config(this.config.configDir);
  }
}
