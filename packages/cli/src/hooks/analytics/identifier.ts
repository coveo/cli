import os from 'os';
import {Identify} from '@amplitude/identify';
import {machineId} from 'node-machine-id';
import {createHash} from 'crypto';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import PlatformClient from '@coveord/platform-client';
import {camelToSnakeCase} from '../../lib/utils/string';
import type {NodeClient} from '@amplitude/node';
import globalConfig from '../../lib/config/globalConfig';
import {Configuration} from '../../lib/config/config';
export class Identifier {
  private authenticatedClient: AuthenticatedClient;

  public constructor() {
    this.authenticatedClient = new AuthenticatedClient();
  }

  public async getIdentity() {
    const platformClient = await this.authenticatedClient.getClient();
    await platformClient.initialize();

    const identifier = new Identify();
    const {userId, isInternalUser} = await this.getAnalyticsInfo(
      platformClient
    );
    const deviceId = await machineId();
    const identity = {
      ...this.getShellInfo(),
      ...this.getDeviceInfo(),
      ...{isInternalUser},
    };

    Object.entries(identity).forEach(([key, value]) => {
      identifier.set(camelToSnakeCase(key), value);
    });

    const identify = (amplitudeClient: NodeClient) => {
      const identifyEvent = {
        ...identifier.identifyUser(userId, deviceId),
        ...this.getAmplitudeBaseEventProperties(),
      };
      amplitudeClient.logEvent(identifyEvent);
    };

    return {userId, deviceId, identify};
  }

  private hash(word: string) {
    const hash = createHash('sha256').update(word);
    return hash.digest('hex').toString();
  }

  private async getAnalyticsInfo(platformClient: PlatformClient) {
    return this.configuration.anonymous
      ? this.getApiKeyInfo()
      : this.getUserInfo(platformClient);
  }

  private async getApiKeyInfo() {
    const identifier = this.configuration.accessToken
      ?.split('-')
      .pop() as string;
    return {
      userId: this.hash(identifier),
      isInternalUser: false,
    };
  }

  private async getUserInfo(platformClient: PlatformClient) {
    const {email} = await platformClient.user.get();
    return {
      userId: this.hash(email),
      isInternalUser: email.match(/@coveo\.com$/) !== null,
    };
  }

  private getAmplitudeBaseEventProperties() {
    const {version, platform} = globalConfig.get();
    return {
      app_version: version,
      os_version: os.release(),
      os_name: platform,
      platform,
    };
  }

  private getDeviceInfo() {
    const {arch, windows, bin, userAgent, debug} = globalConfig.get();
    return {
      arch,
      windows,
      bin,
      userAgent,
      debug,
    };
  }

  private getShellInfo() {
    const {shell} = globalConfig.get();
    const {
      TERM_PROGRAM_VERSION: termProgramVersion,
      TERM_PROGRAM: termProgram,
    } = process.env;
    return {
      shell,
      ...(termProgramVersion && {termProgramVersion}),
      ...(termProgram && {termProgram}),
    };
  }

  private get configuration(): Configuration {
    return this.authenticatedClient.cfg.get();
  }
}
