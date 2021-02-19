import AuthenticationRequired from '../../../lib/decorators/authenticationRequired';
import {Command, flags} from '@oclif/command';
import {platformUrl} from '../../../lib/platform/environment';
import {Storage} from '../../../lib/oauth/storage';
import {Config} from '../../../lib/config/config';
import {spawnProcess} from '../../../lib/utils/process';
import {buildAnalyticsFailureHook} from '../../../hooks/analytics/analytics';

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

  @AuthenticationRequired()
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
    const cfg = await this.configuration.get();
    const storage = await this.storage.get();

    const cliArgs = [
      'add',
      '@coveo/angular',
      '--org-id',
      cfg.organization,
      '--api-key',
      storage.accessToken!,
      '--platform-url',
      platformUrl({environment: cfg.environment}),
      // TODO: CDX-91 Extract user email from oauth flow
      '--user',
      'foo@acme.com',
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
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, {}, err)
    );
    throw err;
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  private get storage() {
    return new Storage();
  }
}
