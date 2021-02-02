import {readJSON, writeJSON, pathExists, createFile} from 'fs-extra';
import {join} from 'path';
import {PlatformEnvironment, PlatformRegion} from '../platform/environment';

export interface Configuration {
  region: PlatformRegion;
  environment: PlatformEnvironment;
  organization: string;
}

export const DefaultConfig: Configuration = {
  environment: 'prod',
  region: 'us-east-1',
  organization: '',
};

export class Config {
  constructor(private configDir: string, private error = console.error) {}

  public async get(): Promise<Configuration> {
    await this.ensureExists();
    try {
      return await readJSON(this.configPath);
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
    return await writeJSON(this.configPath, config);
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

  private get configPath() {
    return join(this.configDir, 'config.json');
  }

  private async ensureExists() {
    const exists = await pathExists(this.configPath);
    if (!exists) {
      await createFile(this.configPath);
      await writeJSON(this.configPath, DefaultConfig);
    }
  }
}
