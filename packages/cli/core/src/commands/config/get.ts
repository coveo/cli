import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Config} from '@coveo/cli-commons/config/config';
import {ConfigRenderer} from '@coveo/cli-commons/config/configRenderer';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import type {Example} from '@oclif/core/lib/interfaces';

export default class Get extends CLICommand {
  public static description = 'Display the current Coveo CLI configuration.';

  public static args = [
    {
      name: 'key',
      description: 'The config key for which to show the value',
      required: false,
    },
  ];

  public static examples: Example[] = [
    {
      command: 'coveo config:get',
      description: 'Get all the configuration values',
    },
    {
      command: 'coveo config:get organization',
      description: 'Get the organization to which you are connected',
    },
    {
      command: 'coveo config:get accessToken',
      description: 'Get the access token given to you by the Coveo Platform',
    },
  ];

  @Trackable()
  public async run() {
    const {args} = await this.parse(Get);
    const cfg = new Config(this.config.configDir);
    const keysToRender = args.key ? [args.key] : undefined;
    ConfigRenderer.render(cfg, keysToRender);
  }
}
