import {Command, flags} from '@oclif/command';
import {resolve} from 'path';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';
import {spawnProcess} from '../../../lib/utils/process';

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

  async run() {
    const {args} = this.parse(React);
    await this.createProject(args.name);
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

  private getReactTemplate(): string {
    // TODO: CDX-58: Publish the template so no need to load the local file
    // return 'cra-template-coveo'
    return `file:${resolve(__dirname, '../../../../../cra-template-coveo')}`;
  }

  private runReactCliCommand(args: string[], options = {}) {
    const executable = require.resolve('create-react-app');
    return spawnProcess(executable, args, options);
  }
}
