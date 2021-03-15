import {Command} from '@oclif/command';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';
import {Config} from '../../../lib/config/config';
import {platformUrl} from '../../../lib/platform/environment';
import {spawnProcess, spawnProcessStdio} from '../../../lib/utils/process';
import {Storage} from '../../../lib/oauth/storage';
import AuthenticationRequired from '../../../lib/decorators/authenticationRequired';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {lt} from 'semver';
export default class React extends Command {
  static description =
    'Create a Coveo Headless-powered search page with the React web framework. See https://docs.coveo.com/en/headless and https://reactjs.org/.';

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
    const storage = await this.storage.get();
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
        storage.accessToken!,
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

  private get storage() {
    return new Storage();
  }

  private async getUserInfo() {
    const authenticatedClient = new AuthenticatedClient();
    const platformClient = await authenticatedClient.getClient();
    await platformClient.initialize();

    return await platformClient.user.get();
  }

  private async checkIfUserHasNodeGreaterThan10() {
    const stdio = await spawnProcessStdio('node', ['--version']);
    if (stdio.stderr && stdio.stderr.match(/ENOENT/i)) {
      this.warn(`${this.id} requires Node.js to run.`);
      this.warnHowToInstallNode();
      return false;
    }

    if (stdio.stderr) {
      this.warn(`${this.id} requires a valid Node.js installation to run.`);
      this.warn(
        'An unknown error happened while trying to determine your node version with node --version.'
      );
      this.warn(stdio.stderr);
      this.warnHowToInstallNode();
      return false;
    }

    const requiredNodeVersionForCreateReactApp = '10.16.0';
    if (lt(stdio.stdout, requiredNodeVersionForCreateReactApp)) {
      this.warn(
        `${this.id} uses create-react-app, which needs a Node.js version greater than ${requiredNodeVersionForCreateReactApp}`
      );
      this.warn(`Version detected: ${stdio.stdout}`);
      this.warnHowToInstallNode();
      return false;
    }

    return true;
  }

  private async checkIfUserHasNpx() {
    const stdio = await spawnProcessStdio('npx', ['--version']);

    if (stdio.stderr && stdio.stderr.match(/ENOENT/i)) {
      this.warn(`${this.id} requires npx to run.`);
      this.warn('Newer version Node.js comes bundled with npx.');
      this.warnHowToInstallNode();
      return false;
    }

    if (stdio.stderr) {
      this.warn(`${this.id} requires a valid npx installation to run.`);
      this.warn(
        'An unknown error happened while trying to determine your npx version with npx --version.'
      );
      this.warn(stdio.stderr);
      this.warnHowToInstallNode();
      return false;
    }

    return true;
  }

  private warnHowToInstallNode() {
    this.warn('Please visit https://nodejs.org/ for installation or upgrade.');
    this.warn(
      'Or use (strongly recommended) https://github.com/nvm-sh/nvm and https://github.com/coreybutler/nvm-windows to manage multiple version of Node.js'
    );
  }
}
