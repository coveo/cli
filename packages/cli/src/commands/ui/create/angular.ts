import {Command, flags} from '@oclif/command';
import {spawnProcess} from '../../../lib/utils/process';

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
    await this.addCoveoToProject(args.name, flags.defaults);
  }

  private async createProject(name: string, defaults: boolean) {
    const cliArgs = ['new', name, '--style', 'scss'];

    if (defaults) {
      cliArgs.push('--defaults');
    }

    return this.runAngularCliCommand(cliArgs);
  }

  private async addCoveoToProject(applicationName: string, defaults: boolean) {
    // TODO: Connect to the user's org (CDX-73)
    // At the moment the api key and orgId have no effect since angular project
    // will be using the public default configuration
    const apiKey = 'foo';
    const orgId = 'bar';

    const cliArgs = [
      'add',
      '@coveo/angular',
      '--org-id',
      orgId,
      '--api-key',
      apiKey,
    ];

    if (defaults) {
      cliArgs.push('--defaults');
    }

    return this.runAngularCliCommand(cliArgs, {cwd: applicationName});
  }

  private runAngularCliCommand(args: string[], options = {}) {
    const executable = require.resolve('@angular/cli/lib/init.js');
    return spawnProcess('node', [executable, ...args], options);
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
