import {Command} from '@oclif/command';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';
import {Config} from '../../../lib/config/config';
import {platformUrl} from '../../../lib/platform/environment';
import {spawnProcess} from '../../../lib/utils/process';
import {Storage} from '../../../lib/oauth/storage';
import AuthenticationRequired from '../../../lib/decorators/authenticationRequired';

export default class React extends Command {
  static description =
    'Create a search page in React powered by Coveo Headless';

  static examples = [
    '$ coveo ui:create:react myapp',
    '$ coveo ui:create:react --help',
  ];

  static args = [
    {name: 'name', description: 'application name', required: true},
  ];

  @AuthenticationRequired()
  async run() {
    const {args} = this.parse(React);
    await this.createProject(args.name);
    await this.setupEnvironmentVariables(args.name);
    await this.config.runHook('analytics', buildAnalyticsSuccessHook(this, {}));
  }

  async catch(err?: Error) {
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, {}, err)
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
        // TODO: CDX-91 Extract user email from oauth flow
        '--user',
        'foo@acme.com',
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
    const executable = require.resolve('create-react-app');
    return spawnProcess(executable, args, options);
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  private get storage() {
    return new Storage();
  }
}
