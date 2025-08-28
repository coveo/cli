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
  atomicAppInitializerPackage,
  atomicLibInitializerPackage,
} from '../../lib/atomic/createAtomicProject';

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
    version: Flags.string({
      char: 'v',
      description: `The version of ${atomicAppInitializerPackage} or ${atomicLibInitializerPackage}  to use.`,
      default: 'latest',
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
  private async createAtomicLib(projectName: string) {
    const {flags} = await this.parse(AtomicInit);
    return createAtomicLib({projectName, initializerVersion: flags.version});
  }

  @Before(...atomicAppPreconditions)
  private async createAtomicApp(projectName: string) {
    const cfg = this.configuration.get();
    const {flags} = await this.parse(AtomicInit);
    return createAtomicApp({
      projectName,
      cfg,
      initializerVersion: flags.version,
    });
  }

  private get configuration() {
    return new Config(this.config.configDir);
  }
}
