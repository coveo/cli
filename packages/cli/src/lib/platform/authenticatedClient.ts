require('isomorphic-fetch');
require('abortcontroller-polyfill');
require('isomorphic-form-data');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const FormData: any;
FormData.prototype.set = FormData.prototype.append;

import PlatformClient from '@coveord/platform-client';
import {Config} from '../config/config';
import {OAuth} from '../oauth/oauth';
import {Storage} from '../oauth/storage';
import {
  castEnvironmentToPlatformClient,
  castRegionToPlatformClient,
} from './environment';

export class AuthenticatedClient {
  public cfg: Config;
  public storage: Storage;
  constructor() {
    this.cfg = new Config(global.config.configDir);
    this.storage = new Storage();
  }

  async isLoggedIn() {
    const {accessToken, refreshToken} = await this.storage.get();
    return accessToken !== null && refreshToken !== null;
  }

  async isExpired() {
    try {
      const c = await this.getClient();
      await c.initialize();
      return false;
    } catch (e) {
      return true;
    }
  }

  async getClient() {
    const {accessToken} = await this.storage.get();
    const {environment, region} = await this.cfg.get();
    return new PlatformClient({
      environment: castEnvironmentToPlatformClient(environment),
      region: castRegionToPlatformClient(region),
      // TODO get orgID from config
      organizationId: '',
      accessToken: accessToken!,
    });
  }

  async getOauth() {
    const {environment, region} = await this.cfg.get();
    return new OAuth({environment, region});
  }

  async refresh() {
    const {refreshToken} = await this.storage.get();
    const {accessToken, refreshToken: newRefreshToken} = await (
      await this.getOauth()
    ).refreshToken(refreshToken!);

    await this.storage.save(accessToken, newRefreshToken!);
  }

  async get() {
    const loggedIn = await this.isLoggedIn();
    if (!loggedIn) {
      console.error('Currently not logged in.');
    }
  }
}
