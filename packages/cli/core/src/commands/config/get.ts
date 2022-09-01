import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Config} from '@coveo/cli-commons/config/config';
import {ConfigRenderer} from '@coveo/cli-commons/config/configRenderer';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';

export default class Get extends CLICommand {
  public static description = 'Display the current configuration.';

  public static args = [
    {
      name: 'key',
      description: 'The config key for which to show the value',
      required: false,
    },
  ];

  public static examples = [
    '$ coveo config:get',
    '$ coveo config:get organization',
    '$ coveo config:get accessToken',
  ];

  @Trackable()
  public async run() {
    const {args} = await this.parse(Get);
    const cfg = new Config(this.config.configDir);
    const keysToRender = args.key ? [args.key] : undefined;
    ConfigRenderer.render(cfg, keysToRender);
  }
}
