import {cli} from 'cli-ux';
import {Command, flags} from '@oclif/command';

import {join} from 'path';
import {EOL} from 'os';
import {Transform} from 'stream';
import {spawn} from 'child_process';

import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';
import {Config} from '../../../lib/config/config';
import {platformUrl} from '../../../lib/platform/environment';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {spawnProcessOutput} from '../../../lib/utils/process';
import {getPackageVersion} from '../../../lib/utils/misc';
import {appendCmdIfWindows} from '../../../lib/utils/os';
import {tryGitCommit} from '../../../lib/utils/git';
import {
  Preconditions,
  IsAuthenticated,
  IsNodeVersionInRange,
  IsNpxInstalled,
  HasNecessaryCoveoPrivileges,
} from '../../../lib/decorators/preconditions';
import {ReactStdoutTransformer} from '../../../lib/ui/create/react/reactStdoutTransformer';

export default class React extends Command {
  public static templateName = '@coveo/cra-template';
  public static cliPackage = 'create-react-app';

  /**
   * Node.JS v10.16.0 is the first version that included NPX (via NPM).
   * Future requirement should be based on https://create-react-app.dev/docs/getting-started/#creating-an-app
   * and https://www.npmjs.com/package/create-react-app package.json engines section.
   */
  public static requiredNodeVersion = '>=10.16.0';

  public static description =
    'Create a Coveo Headless-powered search page with the React web framework. See <https://docs.coveo.com/headless> and <https://reactjs.org/>.';

  public static examples = [
    '$ coveo ui:create:react myapp',
    '$ coveo ui:create:react --help',
  ];

  public static flags = {
    version: flags.string({
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

  @Preconditions(
    IsAuthenticated(),
    IsNodeVersionInRange(React.requiredNodeVersion),
    IsNpxInstalled(),
    HasNecessaryCoveoPrivileges()
  )
  public async run() {
    const args = this.args;

    const finalOutput = await this.createProject(args.name);

    cli.action.start('Creating search token server');
    await this.setupServer(args.name);
    await this.setupEnvironmentVariables(args.name);
    await tryGitCommit(args.name, 'Add token server to project');
    cli.action.stop();

    this.log(EOL);
    process.stdout.write(finalOutput);

    await this.config.runHook('analytics', buildAnalyticsSuccessHook(this, {}));
  }

  public async catch(err?: Error) {
    const args = this.args;
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, args, err)
    );
    throw err;
  }

  private async createProject(name: string) {
    const flags = this.flags;
    const templateVersion =
      flags.version || getPackageVersion(React.templateName);
    return this.runReactCliCommand([
      name,
      '--template',
      `${React.templateName}@${templateVersion}`,
    ]).catch((_e) =>
      Promise.reject(
        new Error(
          'create-react-app was unable to create the project. See the logs above for more information.'
        )
      )
    );
  }

  private async setupEnvironmentVariables(name: string) {
    const args = this.args;
    const cfg = await this.configuration.get();
    const authenticatedClient = new AuthenticatedClient();
    const userInfo = await authenticatedClient.getUserInfo();
    const apiKey = await authenticatedClient.createImpersonateApiKey(args.name);
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
      An unknown error occurred while trying to create the .env file in the project. Please refer to ${join(
        name,
        'README.md'
      )} for more information.
      ${output.stderr}
      `);
      return false;
    }

    return true;
  }

  private async setupServer(name: string) {
    const output = await spawnProcessOutput(
      appendCmdIfWindows`npm`,
      ['run', 'setup-server'],
      {
        cwd: name,
      }
    );

    if (output.exitCode) {
      this.warn(`
      An unknown error occurred while trying to copy the search token server. Please refer to ${join(
        name,
        'README.md'
      )} for more information.
      ${output.stderr ?? ''}
      `);
      return false;
    }

    return true;
  }

  private async runReactCliCommand(commandArgs: string[]) {
    const reactProcess = spawn(
      appendCmdIfWindows`npx`,
      [`${React.cliPackage}@${getPackageVersion(React.cliPackage)}`].concat([
        ...commandArgs,
      ]),
      {stdio: ['inherit', 'pipe', 'inherit']}
    );

    const stdoutTransformer = new ReactStdoutTransformer(this.args.name);
    reactProcess.stdout.pipe(stdoutTransformer).pipe(process.stdout);

    const exitCode = await new Promise((resolve) =>
      reactProcess.on('close', (code) => resolve(code || 0))
    );
    if (exitCode) {
      return Promise.reject();
    } else {
      return stdoutTransformer.remainingStdout;
    }
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
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
