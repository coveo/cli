import {NodeClient} from '@amplitude/node';
import {Identify} from '@amplitude/identify';
import {machineId} from 'node-machine-id';
import {createHash} from 'crypto';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import PlatformClient from '@coveord/platform-client';

export class Identifier {
  private authenticatedClient: AuthenticatedClient;

  public constructor(private amplitudeClient: NodeClient) {
    this.authenticatedClient = new AuthenticatedClient();
  }

  public async identify() {
    const platformClient = await this.authenticatedClient.getClient();
    await platformClient.initialize();
    const {email} = await platformClient.user.get();
    const userId = this.configuration.anonymous ? null : await this.hash(email);
    const deviceId = await machineId();
    const identify = new Identify();
    const identity = {
      ...(await this.getCliInfo()),
      ...(await this.getPlatformInfo(platformClient)),
      ...this.getAdditionalInfo(),
      ...this.getDeviceInfo(),
      ...{isInternalUser: email.match(/@coveo\.com/) !== null}, // TODO: clean that shit
    };

    Object.entries(identity).forEach(([key, value]) => {
      identify.set(key, value);
    });

    this.amplitudeClient.identify(userId, deviceId, identify);
  }

  private async hash(word: string) {
    const md5sum = createHash('md5');
    const hash = md5sum.update(word);
    return hash.digest('hex').toString();
  }

  private async getCliInfo() {
    const {version} = this.configuration;
    return {
      cliVersion: version,
    };
  }

  private async getPlatformInfo(platformClient: PlatformClient) {
    const {environment, region, organization} = this.configuration;
    const {type} = await platformClient.organization.get(organization);

    return {
      organizationType: type,
      environment,
      region,
    };
  }

  private getDeviceInfo() {
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

  private getAdditionalInfo() {
    return {
      // lastSeenDate: '', // TODO:
    };
  }

  private get configuration() {
    return this.authenticatedClient.cfg.get();
  }
}
