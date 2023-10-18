import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Flags} from '@oclif/core';
import {platformUrl} from '@coveo/cli-commons/platform/environment';
import {Config} from '@coveo/cli-commons/config/config';
import {spawnProcess} from '../../../lib/utils/process';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {getPackageVersion} from '../../../lib/utils/misc';
import {
  IsNodeVersionInRange,
  IsNpmVersionInRange,
} from '../../../lib/decorators/preconditions/index';
import {
  HasNecessaryCoveoPrivileges,
  Preconditions,
  IsAuthenticated,
  AuthenticationType,
} from '@coveo/cli-commons/preconditions/index';
import {appendCmdIfWindows} from '@coveo/cli-commons/utils/os';
import {IsNgVersionInRange} from '../../../lib/decorators/preconditions/ng';
import {
  createApiKeyPrivilege,
  impersonatePrivilege,
} from '@coveo/cli-commons/preconditions/platformPrivilege';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';

export default class Angular extends CLICommand {
  public static templateName = '@coveo/angular';
  /**
   * Requirements Based on https://angular.io/guide/setup-local
   * and https://www.npmjs.com/package/@angular/cli package.json engines section.
   */
  public static requiredNodeVersion = '^18.18.1 || ^20.8.1';
  public static requiredNpmVersion = '^9.8.1 || ^10.1.0';
  public static requiredNgVersion = '^15.0.0';

  public static description =
    'Create a Coveo Headless-powered search page with the Angular web framework. See <https://docs.coveo.com/headless> and <https://angular.io/>.';

  public static flags = {
    version: Flags.string({
      char: 'v',
      description: `The version of ${Angular.templateName} to use.`,
      default: getPackageVersion(Angular.templateName),
    }),
    defaults: Flags.boolean({
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

  @Trackable({
    eventName: 'ui create',
    overrideEventProperties: {framework: 'angular'},
  })
  @Preconditions(
    IsAuthenticated([AuthenticationType.OAuth]),
    IsNodeVersionInRange(Angular.requiredNodeVersion),
    IsNpmVersionInRange(Angular.requiredNpmVersion),
    IsNgVersionInRange(Angular.requiredNgVersion),
    HasNecessaryCoveoPrivileges(createApiKeyPrivilege, impersonatePrivilege)
  )
  public async run() {
    const {args, flags} = await this.parse(Angular);
    await this.createProject(args.name, flags.defaults);
    await this.addCoveoToProject(args.name, flags.defaults);
    this.displayFeedbackAfterSuccess(args.name);
  }

  private createProject(name: string, defaults: boolean) {
    const cliArgs = ['new', name, '--style', 'scss', '--routing'];

    if (defaults) {
      cliArgs.push('--defaults');
    }

    return this.runAngularCliCommand(cliArgs);
  }

  private async addCoveoToProject(applicationName: string, defaults: boolean) {
    const {flags, args} = await this.parse(Angular);
    const cfg = this.configuration.get();
    const authenticatedClient = new AuthenticatedClient();
    const apiKey = await authenticatedClient.createImpersonateApiKey(args.name);
    const username = await authenticatedClient.getUsername();
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
      '--platform-environment',
      cfg.environment,
      '--user',
      username,
      '--skip-confirmation',
    ];

    if (defaults) {
      cliArgs.push('--defaults');
    }

    return this.runAngularCliCommand(cliArgs, {cwd: applicationName});
  }

  private runAngularCliCommand(args: string[], options = {}) {
    return spawnProcess(appendCmdIfWindows`ng`, args, options);
  }

  private get configuration() {
    return new Config(this.config.configDir);
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
