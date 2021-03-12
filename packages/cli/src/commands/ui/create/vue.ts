import {Command, flags} from '@oclif/command';
import {resolve} from 'path';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';
import {Config} from '../../../lib/config/config';
import AuthenticationRequired from '../../../lib/decorators/authenticationRequired';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {Storage} from '../../../lib/oauth/storage';
import {platformUrl} from '../../../lib/platform/environment';
import {spawnProcess} from '../../../lib/utils/process';

export default class Vue extends Command {
  static description =
    'Create a Coveo Headless-powered search page with the Vue web framework. See https://docs.coveo.com/en/headless and https://vuejs.org/';

  static flags = {
    help: flags.help({char: 'h'}),
    preset: flags.string({
      char: 'p',
      helpValue: 'path',
      description: [
        'Path to a JSON file with pre-defined options and plugins for creating a new project.',
        'If not specified, the default TypeScript preset is used.',
        'For more information about Vue CLI presets, please consult https://cli.vuejs.org/guide/plugins-and-presets.html#presets',
      ].join('\n'),
    }),
  };

  static examples = [
    '$ coveo ui:create:vue --preset path/to/my/preset.json',
    '$ coveo ui:create:vue --help',
  ];

  static args = [
    {name: 'name', description: 'The target application name.', required: true},
  ];

  @AuthenticationRequired()
  async run() {
    const {args, flags} = this.parse(Vue);

    let preset = require('./presets/typescript-preset.json');

    if (flags.preset) {
      try {
        preset = require(resolve(process.cwd(), flags.preset));
      } catch (error) {
        this.error('Unable to load preset');
      }
    }
    await this.createProject(args.name, preset);
    await this.invokePlugin(args.name);
    await this.config.runHook(
      'analytics',
      buildAnalyticsSuccessHook(this, flags)
    );
  }

  async catch(err?: Error) {
    const {flags} = this.parse(Vue);
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
    throw err;
  }

  private async invokePlugin(applicationName: string) {
    const cfg = await this.configuration.get();
    const storage = await this.storage.get();
    const {providerUsername} = await this.getUserInfo();

    const cliArgs = [
      'add',
      '@coveo/typescript',
      '--orgId',
      cfg.organization,
      '--apiKey',
      storage.accessToken!,
      '--platformUrl',
      platformUrl({environment: cfg.environment}),
      '--user',
      providerUsername,
    ];

    return this.runVueCliCommand(cliArgs, {
      cwd: applicationName,
    });
  }

  private createProject(name: string, preset: {}) {
    return this.runVueCliCommand([
      'create',
      name,
      '--inlinePreset',
      JSON.stringify(preset),
      '--skipGetStarted',
      '--bare',
    ]);
  }

  private runVueCliCommand(args: string[], options = {}) {
    const executable = require.resolve('@vue/cli/bin/vue.js');
    return spawnProcess(executable, args, options);
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
}
