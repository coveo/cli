import {Command} from '@oclif/command';
import {Config} from '../../lib/config/config';
import {Trackable} from '../../lib/decorators/preconditions/trackable';

export default class Get extends Command {
  public static description = 'Display the current configuration.';

  @Trackable()
  public async run() {
    const cfg = await new Config(this.config.configDir, this.error).get();
    delete cfg.accessToken;
    this.log(JSON.stringify(cfg, null, 4));
  }

  @Trackable()
  public async catch(err?: Error) {
    throw err;
  }
}
