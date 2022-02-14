import {Command, Flags} from '@oclif/core';
import {resolve} from 'path';
import {Config} from '../../../lib/config/config';
import {
  Preconditions,
  IsAuthenticated,
  IsNodeVersionInRange,
  HasNecessaryCoveoPrivileges,
  IsNpxInstalled,
} from '../../../lib/decorators/preconditions';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {platformUrl} from '../../../lib/platform/environment';
import {spawnProcess} from '../../../lib/utils/process';
import {getPackageVersion} from '../../../lib/utils/misc';
import {appendCmdIfWindows} from '../../../lib/utils/os';
import {
  createApiKeyPrivilege,
  impersonatePrivilege,
} from '../../../lib/decorators/preconditions/platformPrivilege';
import {Trackable} from '../../../lib/decorators/preconditions/trackable';

export default class Vue extends Command {
  public static templateName = '@coveo/vue-cli-plugin-typescript';
  public static cliPackage = '@vue/cli';

  /**
   * @see https://cli.vuejs.org/guide/installation.html for current requirements.
   * @see https://github.com/vuejs/vue-cli/blob/dev/CHANGELOG.md for upcoming requirements.
   */
  public static requiredNodeVersion = '>=12';
  public static description =
    'Create a Coveo Headless-powered search page with the Vue.js web framework. See <https://docs.coveo.com/headless> and <https://vuejs.org/>.';

  public static flags = {
    version: Flags.string({
      char: 'v',
      description: `The version of ${Vue.templateName} to use.`,
      default: getPackageVersion(Vue.templateName),
    }),
    preset: Flags.string({
      char: 'p',
      helpValue: 'path',
      description: [
        'The path to a JSON file with pre-defined options and plugins for creating a new project.',
        'If not specified, the default TypeScript preset is used.',
        'For more information about Vue CLI presets, see https://cli.vuejs.org/guide/plugins-and-presets.html#presets.',
      ].join('\n'),
    }),
  };

  public static examples = [
    '$ coveo ui:create:vue --preset path/to/my/preset.json',
    '$ coveo ui:create:vue --help',
  ];

  public static args = [
    {
      name: 'name',
      description: 'The name of the application to create.',
      required: true,
    },
  ];

  @Trackable({
    eventName: 'ui create',
    overrideEventProperties: {framework: 'vue'},
  })
  @Preconditions(
    IsAuthenticated(),
    IsNodeVersionInRange(Vue.requiredNodeVersion),
    IsNpxInstalled(),
    HasNecessaryCoveoPrivileges(createApiKeyPrivilege, impersonatePrivilege)
  )
  public async run() {
    const {args, flags} = await this.parse(Vue);

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
  }

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    throw err;
  }

  private async invokePlugin(applicationName: string) {
    const {flags, args} = await this.parse(Vue);
    const cfg = this.configuration.get();
    const authenticatedClient = new AuthenticatedClient();
    const userInfo = await authenticatedClient.getUserInfo();
    const apiKey = await authenticatedClient.createImpersonateApiKey(args.name);
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
      cssPreprocessor: 'sass',
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
    return spawnProcess(
      appendCmdIfWindows`npx`,
      [`${Vue.cliPackage}@${getPackageVersion(Vue.cliPackage)}`, ...args],
      options
    );
  }

  private get configuration() {
    return new Config(this.config.configDir);
  }

  private displayFeedbackAfterSuccess(name: string) {
    this.log(`
    To get started:

    cd ${name}
    npm run start

    See package.json for other available commands.
    Happy hacking!
    `);
  }
}
