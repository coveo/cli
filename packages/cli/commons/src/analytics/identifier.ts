import os from 'os';
import {
  Identify,
  identify as amplitudeIdentify,
} from '@amplitude/analytics-node';
import {machineId} from 'node-machine-id';
import {createHash} from 'crypto';
import {AuthenticatedClient} from '../platform/authenticatedClient';
import PlatformClient from '@coveo/platform-client';
import {camelToSnakeCase} from '../utils/string';
import globalConfig from '../config/globalConfig';
import {Configuration} from '../config/config';
import type {EventOptions} from '@amplitude/analytics-types';

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

    const identify = () => {
      const identifyEvent: EventOptions = {
        user_id: userId,
        device_id: deviceId,
        ...this.getAmplitudeBaseEventProperties(),
      };
      amplitudeIdentify(identifier, identifyEvent);
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

  private isEmailInternal(email: string) {
    return /@(?:coveo|devcoveo\.onmicrosoft)\.com$/.test(email);
  }

  private async getUserInfo(platformClient: PlatformClient) {
    const {email} = await platformClient.user.get();
    const isInternalUser = this.isEmailInternal(email);

    return {
      userId: isInternalUser ? email : this.hash(email),
      isInternalUser,
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
