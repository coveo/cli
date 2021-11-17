import {Command} from '@oclif/command';
import {Config} from '../../lib/config/config';
import {ConfigRenderer} from '../../lib/config/configRenderer';
import {Trackable} from '../../lib/decorators/preconditions/trackable';

export default class Get extends Command {
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
    const {args} = this.parse(Get);
    const cfg = new Config(this.config.configDir, this.error);
    const keysToRender = args.key ? [args.key] : undefined;
    ConfigRenderer.render(cfg, keysToRender);
  }

  @Trackable()
  public async catch(err?: Error) {
    throw err;
  }
}
