import type {NodeClient} from '@amplitude/node';
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

    await this.amplitudeClient.identify(userId, deviceId, identify);
    return {userId, deviceId};
  }

  private async hash(word: string) {
    const hash = createHash('sha256').update(word);
    return hash.digest('hex').toString();
  }

  private async getUserInfo(platformClient: PlatformClient) {
    const {email} = await platformClient.user.get();
    return {
      userId: this.configuration.anonymous ? null : await this.hash(email),
      isInternalUser: email.match(/@coveo\.com/) !== null,
    };
  }

  private getCliInfo() {
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

  private get configuration() {
    return this.authenticatedClient.cfg.get();
  }
}
