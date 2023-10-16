import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Flags} from '@oclif/core';
import {Config} from '@coveo/cli-commons/config/config';
import {platformUrl} from '@coveo/cli-commons/platform/environment';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {spawnProcess, spawnProcessOutput} from '../../../lib/utils/process';
import {getPackageVersion} from '../../../lib/utils/misc';
import {appendCmdIfWindows} from '@coveo/cli-commons/utils/os';
import {
  Preconditions,
  IsAuthenticated,
  HasNecessaryCoveoPrivileges,
  AuthenticationType,
} from '@coveo/cli-commons/preconditions/index';
import {
  createApiKeyPrivilege,
  impersonatePrivilege,
} from '@coveo/cli-commons/preconditions/platformPrivilege';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {
  IsNodeVersionInRange,
  IsNpxInstalled,
} from '../../../lib/decorators/preconditions';

type ReactProcessEnv = {
  orgId: string;
  apiKey: string;
  user: string;
  platformUrl: string;
  platformEnvironment: string;
};

export default class React extends CLICommand {
  public static templateName = '@coveo/cra-template';
  public static cliPackage = 'create-react-app@latest';

  /**
   * "You’ll need to have Node 18.1.1 or later version on your local development machine"
   *  https://github.com/facebook/create-react-app#creating-an-app
   */
  public static requiredNodeVersion = '>=18.1.1';

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
    IsAuthenticated([AuthenticationType.OAuth]),
    IsNodeVersionInRange(React.requiredNodeVersion),
    IsNpxInstalled(),
    HasNecessaryCoveoPrivileges(createApiKeyPrivilege, impersonatePrivilege)
  )
  public async run() {
    const {args} = await this.parse(React);
    await this.createProject(args.name);
    await this.setupEnvironmentVariables(args.name);
  }

  private async setupEnvironmentVariables(name: string) {
    const {args} = await this.parse(React);
    const cfg = this.configuration.get();
    const authenticatedClient = new AuthenticatedClient();
    const username = await authenticatedClient.getUsername();
    const apiKey = await authenticatedClient.createImpersonateApiKey(args.name);

    const env: ReactProcessEnv = {
      orgId: cfg.organization,
      apiKey: apiKey.value!,
      user: username,
      platformUrl: platformUrl({environment: cfg.environment}),
      platformEnvironment: cfg.environment,
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

  private runReactCliCommand(args: string[]) {
    return spawnProcess(appendCmdIfWindows`npx`, [React.cliPackage, ...args]);
  }

  private get configuration() {
    return new Config(this.config.configDir);
  }
}
