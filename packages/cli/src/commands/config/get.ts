import {Command} from '@oclif/command';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../hooks/analytics/analytics';
import {Config} from '../../lib/config/config';

export default class Get extends Command {
  static description = 'Display the current configuration.';

  async run() {
    const cfg = await new Config(this.config.configDir, this.error).get();
    this.log(JSON.stringify(cfg, null, 4));
    await this.config.runHook('analytics', buildAnalyticsSuccessHook(this, {}));
  }

  async catch(err?: Error) {
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, {}, err)
    );
    throw err;
  }
}
