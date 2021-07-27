import {
  pathExists,
  createFileSync,
  writeJSONSync,
  readJSONSync,
} from 'fs-extra';
import {join} from 'path';
import {PlatformEnvironment, PlatformRegion} from '../platform/environment';

export interface Configuration {
  region: PlatformRegion;
  environment: PlatformEnvironment;
  organization: string;
  [k: string]: unknown;
  analyticsEnabled: boolean | undefined;
  accessToken: string | undefined;
}

export const DefaultConfig: Configuration = {
  environment: 'prod',
  region: 'us-east-1',
  organization: '',
  analyticsEnabled: undefined,
  accessToken: undefined,
};

export class Config {
  public constructor(
    private configDir: string,
    private error = console.error
  ) {}

  public async get(): Promise<Configuration> {
    await this.ensureExists();
    try {
      const content = readJSONSync(this.configPath);
      if (content instanceof Error) {
        throw content;
      }
      return content;
    } catch (e) {
      this.error(`Error while reading configuration at ${this.configPath}`);
      await this.replace(DefaultConfig);
      this.error(
        `Configuration has been reset to default value: ${JSON.stringify(
          DefaultConfig
        )}`
      );
      return DefaultConfig;
    }
  }

  public async replace(config: Configuration) {
    await this.ensureExists();
    return writeJSONSync(this.configPath, config);
  }

  public async set<K extends keyof Configuration, V extends Configuration[K]>(
    key: K,
    value: V
  ) {
    await this.ensureExists();
    const config = await this.get();
    config[key] = value;
    await this.replace(config);
  }

  public async setAny(key: string, value: unknown) {
    await this.ensureExists();
    const config = await this.get();
    config[key] = value;
    await this.replace(config);
  }

  public async delete<K extends keyof Configuration>(key: K) {
    await this.ensureExists();
    const config = await this.get();
    delete config[key];
    await this.replace(config);
  }

  public async deleteAny(key: string) {
    await this.ensureExists();
    const config = await this.get();
    delete config[key];
    await this.replace(config);
  }

  private get configPath() {
    return join(this.configDir, 'config.json');
  }

  private async ensureExists() {
    const exists = await pathExists(this.configPath);
    if (!exists) {
      createFileSync(this.configPath);
      writeJSONSync(this.configPath, DefaultConfig);
    }
  }
}
