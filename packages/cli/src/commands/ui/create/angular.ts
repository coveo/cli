import {Command, flags} from '@oclif/command';
import {platformUrl} from '../../../lib/platform/environment';
import {Config} from '../../../lib/config/config';
import {spawnProcess} from '../../../lib/utils/process';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {getPackageVersion} from '../../../lib/utils/misc';
import {
  Preconditions,
  IsAuthenticated,
  IsNodeVersionInRange,
  IsNpmVersionInRange,
} from '../../../lib/decorators/preconditions/';

export default class Angular extends Command {
  public static templateName = '@coveo/angular';
  /**
   * Requirements Based on https://angular.io/guide/setup-local
   * and https://www.npmjs.com/package/@angular/cli package.json engines section.
   */
  public static requiredNodeVersion = '>=12.13.0 <15.0.0';
  public static requiredNpmVersion = '^6.11.0 || ^7.5.6';

  public static description =
    'Create a Coveo Headless-powered search page with the Angular web framework. See <https://docs.coveo.com/headless> and <https://angular.io/>.';

  public static flags = {
    version: flags.string({
      char: 'v',
      description: `THe version of ${Angular.templateName} to use.`,
      default: getPackageVersion(Angular.templateName),
    }),
    defaults: flags.boolean({
      char: 'd',
      description:
        'Whether to automatically select the default value for all prompts that have a default value.',
    }),
  };

  public static args = [
    {
      name: 'name',
      description: 'The name of the application to create.',
      required: true,
    },
  ];

  @Preconditions(
    IsAuthenticated(),
    IsNodeVersionInRange(Angular.requiredNodeVersion),
    IsNpmVersionInRange(Angular.requiredNpmVersion)
  )
  public async run() {
    const {args, flags} = this.parse(Angular);
    await this.createProject(args.name, flags.defaults);
    await this.addCoveoToProject(args.name, flags.defaults);
    this.displayFeedbackAfterSuccess(args.name);
    await this.config.runHook(
      'analytics',
      buildAnalyticsSuccessHook(this, flags)
    );
  }

  private async createProject(name: string, defaults: boolean) {
    const cliArgs = ['new', name, '--style', 'scss', '--routing'];

    if (defaults) {
      cliArgs.push('--defaults');
    }

    return this.runAngularCliCommand(cliArgs);
  }

  private async addCoveoToProject(applicationName: string, defaults: boolean) {
    const cfg = await this.configuration.get();
    const args = this.args;
    const authenticatedClient = new AuthenticatedClient();
    const userInfo = await authenticatedClient.getUserInfo();
    const apiKey = await authenticatedClient.createImpersonateApiKey(args.name);
    const flags = this.flags;
    const schematicVersion =
      flags.version || getPackageVersion(Angular.templateName);

    const cliArgs = [
      'add',
      `${Angular.templateName}@${schematicVersion}`,
      '--org-id',
      cfg.organization,
      '--api-key',
      apiKey.value!,
      '--platform-url',
      platformUrl({environment: cfg.environment}),
      '--user',
      userInfo.providerUsername,
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

  public async catch(err?: Error) {
    const flags = this.flags;
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
    throw err;
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  private get flags() {
    const {flags} = this.parse(Angular);
    return flags;
  }

  private get args() {
    const {args} = this.parse(Angular);
    return args;
  }

  private displayFeedbackAfterSuccess(name: string) {
    this.log(`
    To get started:

    cd ${name}
    npm run start

    See package.json for other available commands.
    Happy hacking!
    `);
  }
}
