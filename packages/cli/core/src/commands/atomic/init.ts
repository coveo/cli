import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Config} from '@coveo/cli-commons/config/config';
import {Flags} from '@oclif/core';
import {
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

    switch (flags.type) {
      case 'app':
      case 'application':
        await this.createAtomicApp(args.name);
        break;
      case 'lib':
      case 'library':
        await createAtomicLib(args.name);
        break;
      default:
        break;
    }
  }

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
