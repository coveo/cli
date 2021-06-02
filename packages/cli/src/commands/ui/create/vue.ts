import {Command, flags} from '@oclif/command';
import {resolve} from 'path';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';
import {Config} from '../../../lib/config/config';
import {
  Preconditions,
  IsAuthenticated,
  IsNodeVersionInRange,
} from '../../../lib/decorators/preconditions';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {platformUrl} from '../../../lib/platform/environment';
import {spawnProcess} from '../../../lib/utils/process';
import {getPackageVersion} from '../../../lib/utils/misc';

export default class Vue extends Command {
  public static templateName = '@coveo/vue-cli-plugin-typescript';

  /**
   * @see https://cli.vuejs.org/guide/installation.html for current requirements.
   * @see https://github.com/vuejs/vue-cli/blob/dev/CHANGELOG.md for upcoming requirements.
   */
  public static requiredNodeVersion = '>=12';
  public static description =
    'Create a Coveo Headless-powered search page with the Vue.js web framework. See https://docs.coveo.com/headless and https://vuejs.org/';

  public static flags = {
    help: flags.help({char: 'h'}),
    version: flags.string({
      char: 'v',
      description: `Version of ${Vue.templateName} to use.`,
      default: getPackageVersion(Vue.templateName),
    }),
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

  public static examples = [
    '$ coveo ui:create:vue --preset path/to/my/preset.json',
    '$ coveo ui:create:vue --help',
  ];

  public static args = [
    {name: 'name', description: 'The target application name.', required: true},
  ];

  @Preconditions(
    IsAuthenticated(),
    IsNodeVersionInRange(Vue.requiredNodeVersion)
  )
  public async run() {
    const {args, flags} = this.parse(Vue);

    let preset = await this.getDefaultPreset();

    if (flags.preset) {
      try {
        preset = require(resolve(process.cwd(), flags.preset));
      } catch (error) {
        this.error('Unable to load custom preset. Using default preset.');
      }
    }
    await this.createProject(args.name, preset);
    await this.invokePlugin(args.name);
    this.displayFeedbackAfterSuccess(args.name);
    await this.config.runHook(
      'analytics',
      buildAnalyticsSuccessHook(this, flags)
    );
  }

  public async catch(err?: Error) {
    const flags = this.flags;
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
    throw err;
  }

  private async invokePlugin(applicationName: string) {
    const args = this.args;
    const cfg = await this.configuration.get();
    const authenticatedClient = new AuthenticatedClient();
    const userInfo = await authenticatedClient.getUserInfo();
    const apiKey = await authenticatedClient.createImpersonateApiKey(args.name);

    const flags = this.flags;
    const presetVersion = flags.version || getPackageVersion(Vue.templateName);

    const cliArgs = [
      'add',
      `${Vue.templateName}@${presetVersion}`,
      '--orgId',
      cfg.organization,
      '--apiKey',
      apiKey.value!,
      '--platformUrl',
      platformUrl({environment: cfg.environment}),
      '--user',
      userInfo.providerUsername,
    ];

    return this.runVueCliCommand(cliArgs, {
      cwd: applicationName,
    });
  }

  private async getDefaultPreset() {
    return {
      useConfigFiles: true,
      plugins: {
        '@vue/cli-plugin-typescript': {
          classComponent: true,
        },
        '@vue/cli-plugin-router': {
          historyMode: true,
        },
        '@vue/cli-plugin-eslint': {
          config: 'standard',
          lintOn: ['commit'],
        },
        // TODO: CDX-189: include coveo template inside the preset instead of running
        // an additional `vue add` command.
        // [Vue.templateName]: {
        //   version: version,
        //   orgId: cfg.organization,
        //   apiKey: storage.accessToken!,
        //   platformUrl: platformUrl({environment: cfg.environment}),
        //   user: providerUsername,
        // },
      },
      cssPreprocessor: 'node-sass',
      vueVersion: '2',
    };
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
    return spawnProcess('node', [executable, ...args], options);
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  private get flags() {
    const {flags} = this.parse(Vue);
    return flags;
  }

  private get args() {
    const {args} = this.parse(Vue);
    return args;
  }

  private displayFeedbackAfterSuccess(name: string) {
    this.log(`
    To get started:

    cd ${name}
    npm run start

    See package.json for other available commands.
    Happy hacking !
    `);
  }
}
