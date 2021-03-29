import {Command, flags} from '@oclif/command';
import {platformUrl} from '../../../lib/platform/environment';
import {Storage} from '../../../lib/oauth/storage';
import {Config} from '../../../lib/config/config';
import {spawnProcess} from '../../../lib/utils/process';
import {buildAnalyticsFailureHook} from '../../../hooks/analytics/analytics';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {getPackageVersion} from '../../../lib/utils/misc';
import Preconditions, {
  IsAuthenticated,
} from '../../../lib/decorators/preconditions';

export default class Angular extends Command {
  static templateName = '@coveo/angular';

  static description =
    'Create a Coveo Headless-powered search page with the Angular web framework. See https://docs.coveo.com/en/headless and https://angular.io/.';

  static flags = {
    version: flags.string({
      char: 'v',
      description: `Version of ${Angular.templateName} to use.`,
      default: getPackageVersion(Angular.templateName),
    }),
    defaults: flags.boolean({
      char: 'd',
      description:
        'Automatically select the default value for all prompts where such a default value exists.',
    }),
  };

  static args = [
    {name: 'name', description: 'The target application name.', required: true},
  ];

  @Preconditions(IsAuthenticated())
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
    const {providerUsername} = await this.getUserInfo();
    const {flags} = this.parse(Angular);
    const schematicVersion =
      flags.version || getPackageVersion(Angular.templateName);

    const cliArgs = [
      'add',
      `${Angular.templateName}@${schematicVersion}`,
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

  private async getUserInfo() {
    const authenticatedClient = new AuthenticatedClient();
    const platformClient = await authenticatedClient.getClient();
    await platformClient.initialize();

    return await platformClient.user.get();
  }
}
