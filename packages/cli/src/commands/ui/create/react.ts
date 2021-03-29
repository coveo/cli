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
import Preconditions, {
  IsNodeVersionAbove,
  IsAuthenticated,
  IsNpxInstalled,
} from '../../../lib/decorators/preconditions';

export default class React extends Command {
  static templateName = '@coveo/cra-template';
  static requiredNodeVersion = '10.16.0';

  static description = `Create a Coveo Headless-powered search page with the React web framework.`;

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
    IsNodeVersionAbove(React.requiredNodeVersion),
    IsNpxInstalled()
  )
  async run() {
    const {args} = this.parse(React);

    await this.createProject(args.name);
    await this.setupEnvironmentVariables(args.name);
    await this.config.runHook('analytics', buildAnalyticsSuccessHook(this, {}));
  }

  async catch(err?: Error) {
    const {args} = this.parse(React);
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, args, err)
    );
    throw err;
  }

  private createProject(name: string) {
    const {flags} = this.parse(React);
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
    const {providerUsername} = await this.getUserInfo();

    const output = await spawnProcessOutput(
      'npm',
      [
        'run',
        'setup-env',
        '--',
        '--orgId',
        cfg.organization,
        '--apiKey',
        cfg.accessToken!,
        '--platformUrl',
        platformUrl({environment: cfg.environment}),
        '--user',
        providerUsername,
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
    return spawnProcess('npx', ['create-react-app'].concat(args), options);
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  private async getUserInfo() {
    const authenticatedClient = new AuthenticatedClient();
    const platformClient = await authenticatedClient.getClient();
    await platformClient.initialize();

    return await platformClient.user.get();
  }
}
