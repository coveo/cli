import {Command, Flags} from '@oclif/core';
import {Config} from '../../../lib/config/config';
import {platformUrl} from '../../../lib/platform/environment';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {spawnProcess, spawnProcessOutput} from '../../../lib/utils/process';
import {getPackageVersion} from '../../../lib/utils/misc';
import {appendCmdIfWindows} from '../../../lib/utils/os';
import {
  Preconditions,
  IsAuthenticated,
  IsNodeVersionInRange,
  IsNpxInstalled,
  HasNecessaryCoveoPrivileges,
} from '../../../lib/decorators/preconditions';
import {
  createApiKeyPrivilege,
  impersonatePrivilege,
} from '../../../lib/decorators/preconditions/platformPrivilege';
import {Trackable} from '../../../lib/decorators/preconditions/trackable';

type ReactProcessEnv = {
  orgId: string;
  apiKey: string;
  user: string;
  platformUrl: string;
};

export default class React extends Command {
  public static templateName = '@coveo/cra-template';
  public static cliPackage = 'create-react-app@latest';

  /**
   * "You’ll need to have Node 14.0.0 or later version on your local development machine"
   *  https://github.com/facebook/create-react-app#creating-an-app
   */
  public static requiredNodeVersion = '>=14.0.0';

  public static description =
    'Create a Coveo Headless-powered search page with the React web framework. See <https://docs.coveo.com/headless> and <https://reactjs.org/>.';

  public static examples = [
    '$ coveo ui:create:react myapp',
    '$ coveo ui:create:react --help',
  ];

  public static flags = {
    version: Flags.string({
      char: 'v',
      description: `Version of ${React.templateName} to use.`,
      default: getPackageVersion(React.templateName),
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
    overrideEventProperties: {framework: 'react'},
  })
  @Preconditions(
    IsAuthenticated(),
    IsNodeVersionInRange(React.requiredNodeVersion),
    IsNpxInstalled(),
    HasNecessaryCoveoPrivileges(createApiKeyPrivilege, impersonatePrivilege)
  )
  public async run() {
    const {args} = await this.parse(React);
    await this.createProject(args.name);
    await this.setupEnvironmentVariables(args.name);
  }

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    throw err;
  }

  private async setupEnvironmentVariables(name: string) {
    const {args} = await this.parse(React);
    const cfg = this.configuration.get();
    const authenticatedClient = new AuthenticatedClient();
    const userInfo = await authenticatedClient.getUserInfo();
    const apiKey = await authenticatedClient.createImpersonateApiKey(args.name);

    const env: ReactProcessEnv = {
      orgId: cfg.organization,
      apiKey: apiKey.value!,
      user: userInfo.providerUsername,
      platformUrl: platformUrl({environment: cfg.environment}),
    };

    await spawnProcessOutput(appendCmdIfWindows`npm`, ['run', 'setup-env'], {
      cwd: name,
      env: {...process.env, ...env},
    });
  }

  private async createProject(name: string) {
    const {flags} = await this.parse(React);
    const templateVersion =
      flags.version || getPackageVersion(React.templateName);
    const exitCode = await this.runReactCliCommand([
      name,
      '--template',
      `${React.templateName}@${templateVersion}`,
    ]);

    if (exitCode !== 0) {
      this.error(
        new Error(
          'create-react-app was unable to create the project. See the logs above for more information.'
        )
      );
    }
  }

  private async runReactCliCommand(args: string[]) {
    return spawnProcess(appendCmdIfWindows`npx`, [React.cliPackage, ...args]);
  }

  private get configuration() {
    return new Config(this.config.configDir);
  }
}
