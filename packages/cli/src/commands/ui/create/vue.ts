import {Command, flags} from '@oclif/command';
import {spawnSync} from 'child_process';
import {dirname} from 'path';

export default class UiCreateVue extends Command {
  static description = 'Create a new project powered by vue-cli-service';

  static flags = {
    help: flags.help({char: 'h'}),
    preset: flags.string({
      char: 'p',
      description:
        'Path to a JSON file with pre-defined options and plugins for creating a new project',
    }),
  };

  static args = [
    {name: 'name', description: 'application name', required: true},
  ];

  async run() {
    const {args, flags} = this.parse(UiCreateVue);
    const preset = flags.preset ?? this.getDefaultPreset();

    await this.createProject(args.name, preset);
    await this.installPlugin(args.name);
    await this.invokePlugin(args.name);
    await this.startServer(args.name);
  }

  private installPlugin(applicationName: string) {
    // TODO: Once plugin is published to npm, simply include it in the preset typescript-preset.json
    // This will prevent from running `2 npm install` commands (one by @vue/cli, one for the plugin)
    const pathToPlugin = dirname(require.resolve('vue-cli-plugin-coveo'));
    this.spawnSyncProcess(
      'npm',
      ['install', '--save-dev', `file:${pathToPlugin}`],
      {cwd: applicationName}
    );
  }

  private invokePlugin(applicationName: string) {
    this.runVueCliCommand(['invoke', 'vue-cli-plugin-coveo'], {
      cwd: applicationName,
    });
  }

  private startServer(applicationName: string) {
    this.log(
      // `Your project has been created locally and the relevant code is in the ${applicationName} directory`
      '\n\nYou are now ready to start your app. Just execute:'
    );
    this.log(`$ cd ${applicationName} && npm run serve`);
    // TODO: run the server automatically
  }

  private getTypeScriptPreset(): {} {
    // TODO: also configure javascript preset
    return require('./presets/typescript-preset.json');
  }

  private getDefaultPreset(): {} {
    return this.getTypeScriptPreset();
  }

  private createProject(name: string, preset: {}) {
    this.runVueCliCommand([
      'create',
      name,
      '--inlinePreset',
      JSON.stringify(preset),
    ]);
  }

  private runVueCliCommand(args: string[], options = {}) {
    const executable = require.resolve('@vue/cli/bin/vue.js');
    this.spawnSyncProcess(executable, args, options);
  }

  private spawnSyncProcess(command: string, args: string[], options = {}) {
    const cmd = spawnSync(command, args, {
      stdio: ['inherit', 'inherit', 'inherit'],
      ...options,
    });

    if (cmd.status !== 0) {
      // Any error triggered by the execution of the previous command will display.
      // So no need to bubble up the error. Also, there is no point in continuing the process.
      this.error(`Following command has failed: ${command} ${args.join(' ')}`);
    }
  }
}
