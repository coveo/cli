import {Command, flags} from '@oclif/command';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';
import {Config} from '../../../lib/config/config';
import {platformUrl} from '../../../lib/platform/environment';
import {spawnProcess, spawnProcessOutput} from '../../../lib/utils/process';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {getPackageVersion} from '../../../lib/utils/misc';
import {join} from 'path';
import {
  Preconditions,
  IsAuthenticated,
  IsNodeVersionInRange,
  IsNpxInstalled,
} from '../../../lib/decorators/preconditions';
import {appendCmdIfWindows} from '../../../lib/utils/os';

export default class React extends Command {
  static templateName = '@coveo/cra-template';
  /**
   * Node.JS v10.16.0 is the first version that included NPX (via NPM).
   * Future requirement should be based on https://create-react-app.dev/docs/getting-started/#creating-an-app
   * and https://www.npmjs.com/package/create-react-app package.json engines section.
   */
  static requiredNodeVersion = '>=10.16.0';

  static description =
    'Create a Coveo Headless-powered search page with the React web framework. See https://docs.coveo.com/headless and https://reactjs.org/.';

  static examples = [
    '$ coveo ui:create:react myapp',
    '$ coveo ui:create:react --help',
  ];

  static flags = {
    version: flags.string({
      char: 'v',
      description: `Version of ${React.templateName} to use.`,
      default: getPackageVersion(React.templateName),
    }),
  };

  static args = [
    {name: 'name', description: 'The target application name.', required: true},
  ];

  @Preconditions(
    IsAuthenticated(),
    IsNodeVersionInRange(React.requiredNodeVersion),
    IsNpxInstalled()
  )
  async run() {
    const args = this.args;

    await this.createProject(args.name);
    await this.setupEnvironmentVariables(args.name);
    await this.config.runHook('analytics', buildAnalyticsSuccessHook(this, {}));
  }

  async catch(err?: Error) {
    const args = this.args;
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, args, err)
    );
    throw err;
  }

  private createProject(name: string) {
    const flags = this.flags;
    const templateVersion =
      flags.version || getPackageVersion(React.templateName);
    return this.runReactCliCommand([
      name,
      '--template',
      `${React.templateName}@${templateVersion}`,
    ]);
  }

  private async setupEnvironmentVariables(name: string) {
    const cfg = await this.configuration.get();
    const {userInfo, apiKey} = await this.platformUserCredentials();

    const output = await spawnProcessOutput(
      appendCmdIfWindows`npm`,
      [
        'run',
        'setup-env',
        '--',
        '--orgId',
        cfg.organization,
        '--apiKey',
        apiKey.value!,
        '--platformUrl',
        platformUrl({environment: cfg.environment}),
        '--user',
        userInfo.providerUsername,
      ],
      {
        cwd: name,
      }
    );

    if (output.stderr) {
      this.warn(`
      An unknown error happened while trying to create the .env file in the project. Please refer to ${join(
        name,
        'README.md'
      )} for more detail.
      ${output.stderr}
      `);
      return false;
    }

    return true;
  }

  private runReactCliCommand(args: string[], options = {}) {
    return spawnProcess(
      appendCmdIfWindows`npx`,
      ['create-react-app'].concat(args),
      options
    );
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  private async platformUserCredentials() {
    const args = this.args;
    const authenticatedClient = new AuthenticatedClient();
    const platformClient = await authenticatedClient.getClient();
    await platformClient.initialize();

    const userInfo = await platformClient.user.get();
    const apiKey = await authenticatedClient.createImpersonateApiKey(args.name);

    return {userInfo, apiKey};
  }

  private get flags() {
    const {flags} = this.parse(React);
    return flags;
  }

  private get args() {
    const {args} = this.parse(React);
    return args;
  }
}
