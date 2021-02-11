import cli from '@angular/cli';
import {Command, flags} from '@oclif/command';
import {spawnProcess} from '../../../lib/utils/process';
import {dirname} from 'path';

export default class Angular extends Command {
  static description =
    'Create a search page with Angular powered by Coveo Headless';

  static flags = {
    defaults: flags.boolean({
      char: 'd',
      description:
        'Disable interactive input prompts for options with a default',
    }),
  };

  static args = [
    {name: 'name', description: 'application name', required: true},
  ];

  async run() {
    const {args, flags} = this.parse(Angular);
    await this.createProject(args.name, flags.defaults);
    await this.installLocalSchematic(args.name);
    await this.addCoveoToProject(args.name, flags.defaults);

    this.exit(0);
  }

  private async createProject(name: string, defaults: boolean) {
    const options = {
      cliArgs: ['new', name, '--style', 'scss'],
    };

    if (defaults) {
      options.cliArgs.push('--defaults');
    }

    const exitCode = await cli(options);

    if (exitCode !== 0) {
      throw new Error(
        `Could not setup angular project. Error code: ${exitCode}`
      );
    }
  }

  private async addCoveoToProject(name: string, defaults: boolean) {
    // TODO: Connect to the user's org (CDX-73)
    // At the moment the api key and orgId have no effect since angular project
    // will be using the public default configuration
    const apiKey = 'foo';
    const orgId = 'bar';

    const options = {
      cliArgs: [
        'add',
        '@coveo/angular',
        '--org-id',
        orgId,
        '--api-key',
        apiKey,
      ],
    };

    if (defaults) {
      options.cliArgs.push('--defaults');
    }

    process.chdir(name);
    const exitCode = await cli(options);

    if (exitCode !== 0) {
      throw new Error(`Could not run Coveo schematic. Error code: ${exitCode}`);
    }
  }

  /**
   * TODO: CDX-71
   * The @coveo/angular package is not yet published to npm, so we need to fetch it locally.
   * Once the @coveo/angular schematic is published to npm, `ng add @coveo/angular ...` will fetch
   * the schematic from the npm registry
   */
  private installLocalSchematic(applicationName: string) {
    const pathToSchematic = dirname(require.resolve('@coveo/angular'));
    return spawnProcess(
      'npm',
      ['install', '--save-dev', `file:${pathToSchematic}`],
      {
        cwd: applicationName,
      }
    );
  }

  async catch(err?: Error) {
    // TODO: merge PR #18 before uncommenting
    // await this.config.runHook(
    //   'analytics',
    //   buildAnalyticsFailureHook(this, {}, err)
    // );
    throw err;
  }
}
