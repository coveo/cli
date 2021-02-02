import {Command} from '@oclif/command';
import {Config} from '../../lib/config/config';

export default class Get extends Command {
  static description = 'Display the current configuration.';

  async run() {
    const cfg = await new Config(this.config.configDir, this.error).get();
    this.log(JSON.stringify(cfg, null, 4));
  }
}
