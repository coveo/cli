import {Command} from '@oclif/command';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';
import {Config} from '../../../lib/config/config';
import {platformUrl} from '../../../lib/platform/environment';
import {
  spawnProcess,
  SpawnProcessOutput,
  spawnProcessOutput,
} from '../../../lib/utils/process';
import AuthenticationRequired from '../../../lib/decorators/authenticationRequired';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {lt as isVersionLessThan} from 'semver';
import {constants} from 'os';

const linkToReadme =
  'https://github.com/coveo/cli/wiki#coveo-uicreatereact-requirements';

export default class React extends Command {
  static description = `Create a Coveo Headless-powered search page with the React web framework. See ${linkToReadme}`;

  static examples = [
    '$ coveo ui:create:react myapp',
    '$ coveo ui:create:react --help',
  ];

  static args = [
    {name: 'name', description: 'The target application name.', required: true},
  ];

  @AuthenticationRequired()
  async run() {
    const {args} = this.parse(React);
    if (!(await this.checkIfUserHasNodeGreaterThan10())) {
      return;
    }
    if (!(await this.checkIfUserHasNpx())) {
      return;
    }

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
    return this.runReactCliCommand([
      name,
      '--template',
      this.getReactTemplate(),
    ]);
  }

  private async setupEnvironmentVariables(name: string) {
    const cfg = await this.configuration.get();
    const {providerUsername} = await this.getUserInfo();

    return spawnProcess(
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
  }

  private getReactTemplate(): string {
    return '@coveo/cra-template';
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

  private async checkIfUserHasNodeGreaterThan10() {
    const output = await spawnProcessOutput('node', ['--version']);
    if (this.isMissingExecutable(output)) {
      this.warn(`
      ${this.id} requires Node.js to run.
      `);
      this.warnHowToInstallNode();
      return false;
    }

    if (output.stderr) {
      this.warn(`
      ${this.id} requires a valid Node.js installation to run.
      An unknown error happened while trying to determine your node version with node --version
      ${output.stderr}
      `);
      this.warnHowToInstallNode();
      return false;
    }

    const requiredNodeVersionForCreateReactApp = '10.16.0';
    if (
      isVersionLessThan(output.stdout, requiredNodeVersionForCreateReactApp)
    ) {
      this.warn(`
      ${this.id} uses create-react-app, which needs a Node.js version greater than ${requiredNodeVersionForCreateReactApp}
      Version detected: ${output.stdout}
      `);
      this.warnHowToInstallNode();
      return false;
    }

    return true;
  }

  private async checkIfUserHasNpx() {
    const output = await spawnProcessOutput('npx', ['--version']);

    if (this.isMissingExecutable(output)) {
      this.warn(`
      ${this.id} requires npx to run.
      Newer version Node.js comes bundled with npx.
      `);
      this.warnHowToInstallNode();
      return false;
    }

    if (output.stderr) {
      this.warn(`
      ${this.id} requires a valid npx installation to run.
      An unknown error happened while trying to determine your npx version with npx --version.
      ${output.stderr}
      `);
      this.warnHowToInstallNode();
      return false;
    }

    return true;
  }

  private isMissingExecutable(output: SpawnProcessOutput) {
    return (
      output.exitCode !== null &&
      Math.abs(output.exitCode) === constants.errno.ENOENT
    );
  }

  private warnHowToInstallNode() {
    this.warn(`
    Please visit ${linkToReadme} for more detailed installation information.
    `);
  }
}
