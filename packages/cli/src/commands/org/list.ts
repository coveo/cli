import {Command} from '@oclif/command';
import {Config} from '../../lib/config/config';
import {Storage} from '../../lib/oauth/storage';
import {platformUrl} from '../../lib/platform/environment';
import * as axios from 'axios';

export default class List extends Command {
  static description = 'test command for oauth + config that list orgs';

  static args = [{name: 'file'}];

  async run() {
    // Just an example on how we'd be able to leverage the config + access token storage to perform requests
    const {accessToken} = await new Storage().get();
    const cfg = await new Config(this.config.configDir, this.error).get();
    const res = await axios.default.get(
      `${platformUrl({
        environment: cfg.environment,
        region: cfg.region,
      })}/rest/organizations`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    this.log(res.data);
  }
}
