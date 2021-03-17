import AuthenticationRequired from '../../../lib/decorators/authenticationRequired';
import {Command, flags} from '@oclif/command';
import {platformUrl} from '../../../lib/platform/environment';
import {Storage} from '../../../lib/oauth/storage';
import {Config} from '../../../lib/config/config';
import {spawnProcess} from '../../../lib/utils/process';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';

export default class Angular extends Command {
  static description =
    'Create a Coveo Headless-powered search page with the Angular web framework. See https://docs.coveo.com/en/headless and https://angular.io/.';

  static flags = {
    defaults: flags.boolean({
      char: 'd',
      description:
        'Automatically select the default value for all prompts where such a default value exists.',
    }),
  };

  static args = [
    {name: 'name', description: 'The target application name.', required: true},
  ];

  @AuthenticationRequired()
  async run() {
    const {args, flags} = this.parse(Angular);
    await this.createProject(args.name, flags.defaults);
    await this.addCoveoToProject(args.name, flags.defaults);
    await this.config.runHook(
      'analytics',
      buildAnalyticsSuccessHook(this, flags)
    );
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
    const {providerUsername} = await this.getUserInfo();

    const cliArgs = [
      'add',
      '@coveo/angular',
      '--org-id',
      cfg.organization,
      '--api-key',
      storage.accessToken!,
      '--platform-url',
      platformUrl({environment: cfg.environment}),
      '--user',
      providerUsername,
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
    const {flags} = this.parse(Angular);
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
    throw err;
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  private get storage() {
    return new Storage();
  }

  private async getUserInfo() {
    const authenticatedClient = new AuthenticatedClient();
    const platformClient = await authenticatedClient.getClient();
    await platformClient.initialize();

    return await platformClient.user.get();
  }
}
