import {Identify} from '@amplitude/identify';
import {machineId} from 'node-machine-id';
import {createHash} from 'crypto';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import PlatformClient from '@coveord/platform-client';

export class Identifier {
  private authenticatedClient: AuthenticatedClient;

  public constructor() {
    this.authenticatedClient = new AuthenticatedClient();
  }

  public async getIdentity() {
    const platformClient = await this.authenticatedClient.getClient();
    await platformClient.initialize();

    const identify = new Identify();
    const {userId, isInternalUser} = await this.getUserInfo(platformClient);
    const deviceId = await machineId();
    const platformInfo = await this.getPlatformInfo(platformClient);
    const identity = {
      ...platformInfo,
      ...this.getCliInfo(),
      ...this.getDeviceInfo(),
      ...{isInternalUser},
    };

    Object.entries(identity).forEach(([key, value]) => {
      identify.set(key, value);
    });

    return {userId, deviceId, identify};
  }

  private async hash(word: string) {
    const hash = createHash('sha256').update(word);
    return hash.digest('hex').toString();
  }

  private async getUserInfo(platformClient: PlatformClient) {
    const {email} = await platformClient.user.get();
    return {
      userId: this.configuration.anonymous ? null : await this.hash(email),
      // TODO: CDX-660: convert all properties to snake-case
      isInternalUser: email.match(/@coveo\.com$/) !== null,
    };
  }

  private getCliInfo() {
    const {version} = this.configuration;
    return {
      // TODO: CDX-660: convert all properties to snake-case
      cliVersion: version,
    };
  }

  private async getPlatformInfo(platformClient: PlatformClient) {
    const {environment, region, organization} = this.configuration;
    const {type} = await platformClient.organization.get(organization);

    return {
      // TODO: CDX-660: convert all properties to snake-case
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
      // TODO: CDX-660: convert all properties to snake-case
      userAgent,
      debug,
    };
  }

  private get configuration() {
    return this.authenticatedClient.cfg.get();
  }
}
