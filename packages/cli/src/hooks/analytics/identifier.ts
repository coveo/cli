import {NodeClient} from '@amplitude/node';
import {Identify} from '@amplitude/identify';
import {machineId} from 'node-machine-id';
import {cli} from 'cli-ux';
import {Config} from '../../lib/config/config';

export class Identifier {
  public constructor(private client: NodeClient) {}

  public async init() {
    const identify = new Identify();

    // TODO: rename
    // const info = {
    //   ...(await this.getCliInfo()),
    //   ...(await this.getPlatformInfo()),
    //   ...this.getAdditionalInfo(),
    //   ...this.getDeviceInfo(),
    // };

    identify
      .set('start_date', 'March 3rd')
      .add('num_clicks', 4)
      .unset('needs_to_activate');

    const userId = await this.getUserId();
    const deviceId = await machineId();
    this.client.identify(userId, deviceId, identify);
  }

  public getUserId(): string {
    throw new Error('TODO:');
  }

  public async getDeviceId() {
    const id = await machineId();
    return id;
  }

  public async getCliInfo() {
    const cfg = await this.configuration.get();
    return {
      cliVersion: cfg.version,
      // isLatestCliVersion: '', TODO:
      // firstInteraction: '', TODO:
    };
  }

  public async getPlatformInfo() {
    // const {environment, region, organization, accessToken} =
    const {environment, region} = await this.configuration.get();
    return {
      // organizationType: '', TODO:
      environment,
      region,
      // isInternalUser: '', TODO:
    };
  }

  public getDeviceInfo() {
    const {shell, arch, platform, windows, bin, userAgent, debug} = config;
    return {
      shell,
      arch,
      platform,
      windows,
      bin,
      userAgent,
      debug,
    };
  }

  public getAdditionalInfo() {
    return {
      // lastSeenDate: '', // TODO:
    };
  }

  private get configuration() {
    return new Config(config.configDir, cli.error);
  }
}
