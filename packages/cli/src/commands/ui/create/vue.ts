import {Command, flags} from '@oclif/command';
import {dirname, resolve} from 'path';
import {spawnProcess} from '../../../lib/utils/process';

export default class Vue extends Command {
  static description = 'Create a new project powered by vue-cli-service';

  static flags = {
    help: flags.help({char: 'h'}),
    preset: flags.string({
      char: 'p',
      helpValue: 'path',
      description: [
        'Path to a JSON file with pre-defined options and plugins for creating a new project.',
        'If not specified, the default TypeScript preset will be taked',
        'For more information about Vue CLI presets, please consult https://cli.vuejs.org/guide/plugins-and-presets.html#presets',
      ].join('\n'),
      default: resolve(__dirname, './presets/typescript-preset.json'),
    }),
  };

  static examples = [
    '$ coveo ui:create:vue --preset path/to/my/preset.json',
    '$ coveo ui:create:vue --help',
  ];

  static args = [
    {name: 'name', description: 'application name', required: true},
  ];

  async run() {
    const {args, flags} = this.parse(Vue);

    let preset = '';
    try {
      preset = require(flags.preset);
    } catch (error) {
      this.error('Unable to load preset');
    }
    await this.createProject(args.name, preset);
    await this.installPlugin(args.name);
    await this.invokePlugin(args.name);
    this.startServer(args.name);
  }

  private installPlugin(applicationName: string) {
    // TODO: DELETE THIS METHOD ONCE THE PLUGIN IS PUBLISHED AND PART OF THE PRESET
    // CDX-39
    // Once the coveo plugin is published to npm, simply include it in the preset typescript-preset.json
    // This will prevent from running `2 npm install` commands (one by @vue/cli, one for the plugin)
    const pathToPlugin = dirname(require.resolve('vue-cli-plugin-coveo'));
    return spawnProcess(
      'npm',
      ['install', '--save-dev', `file:${pathToPlugin}`],
      {
        cwd: applicationName,
      }
    );
  }

  private invokePlugin(applicationName: string) {
    return this.runVueCliCommand(['invoke', 'vue-cli-plugin-coveo'], {
      cwd: applicationName,
    });
  }

  private startServer(applicationName: string) {
    // TODO: DELETE THIS METHOD ONCE THE PLUGIN IS PUBLISHED AND PART OF THE PRESET
    // The @vue/cli already logs instructions once the installation completes
    this.log(`Successfully created project ${applicationName}.`);
    this.log('Get started with the following commands:\n');

    this.log('$ cd ${applicationName}');
    this.log('$ yarn serve');
  }

  private createProject(name: string, preset: {}) {
    return this.runVueCliCommand([
      'create',
      name,
      '--inlinePreset',
      JSON.stringify(preset),
    ]);
  }

  private runVueCliCommand(args: string[], options = {}) {
    const executable = require.resolve('@vue/cli/bin/vue.js');
    return spawnProcess(executable, args, options);
  }
}
