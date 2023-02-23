import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Config} from '@coveo/cli-commons/config/config';
import {ConfigRenderer} from '@coveo/cli-commons/config/configRenderer';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {Args} from '@oclif/core';

export default class Get extends CLICommand {
  public static description = 'Display the current Coveo CLI configuration.';

  public static args = {
    key: Args.string({
      description: 'The config key for which to show the value',
      required: false,
      options: Config.userFacingConfigKeys,
    }),
  };

  public static examples = [
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
    ConfigRenderer.render(
      cfg,
      <typeof Config.userFacingConfigKeys>keysToRender
    );
  }
}
