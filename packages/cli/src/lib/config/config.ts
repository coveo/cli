import {Region} from '@coveord/platform-client';
import {CliUx} from '@oclif/core';
import {
  pathExistsSync,
  createFileSync,
  writeJSONSync,
  readJSONSync,
} from 'fs-extra';
import {join} from 'path';
import {satisfies} from 'semver';
import dedent from 'ts-dedent';
import {
  DEFAULT_ENVIRONMENT,
  DEFAULT_REGION,
  PlatformEnvironment,
} from '../platform/environment';
import {IncompatibleConfigurationError} from './configErrors';
import {CurrentSchemaVersion} from './configSchemaVersion';

export interface BaseConfiguration {
  version: string;
  region: Region;
  environment: PlatformEnvironment;
  organization: string;
  analyticsEnabled: boolean | undefined;
  accessToken: string | undefined;
  anonymous?: boolean | undefined;
}

interface AdditionalConfiguration {
  [k: string]: unknown;
}
export type Configuration = BaseConfiguration & AdditionalConfiguration;

export class Config {
  public static userFacingConfigKeys: (keyof BaseConfiguration)[] = [
    'environment',
    'organization',
    'region',
    'analyticsEnabled',
  ];
  public constructor(private configDir: string) {}

  public get(): Configuration {
    this.ensureExists();
    try {
      const content = readJSONSync(this.configPath);
      if (content instanceof Error) {
        throw content;
      }
      if (!this.isSettingVersionInRange(content)) {
        throw new IncompatibleConfigurationError(content.version);
      }
      return content;
    } catch (e) {
      if (e instanceof IncompatibleConfigurationError) {
        CliUx.ux.error(
          dedent`
            The configuration at ${this.configPath} is not compatible with this version of the CLI:
            ${e.message}`,
          {exit: false}
        );
      } else {
        CliUx.ux.error(
          `Error while reading configuration at ${this.configPath}`,
          {exit: false}
        );
      }
      this.replace(DefaultConfig);
      CliUx.ux.error(
        `Configuration has been reset to default value: ${JSON.stringify(
          DefaultConfig
        )}`,
        {exit: false}
      );
      return DefaultConfig;
    }
  }

  private isSettingVersionInRange(content: Configuration) {
    return satisfies(content.version, `^${CurrentSchemaVersion}`);
  }

  public replace(config: Configuration) {
    this.ensureExists();
    return writeJSONSync(this.configPath, config);
  }

  public set<K extends keyof Configuration, V extends Configuration[K]>(
    key: K,
    value: V
  ) {
    this.ensureExists();
    const config = this.get();
    config[key] = value;
    this.replace(config);
  }

  public setAny(key: string, value: unknown) {
    this.ensureExists();
    const config = this.get();
    config[key] = value;
    this.replace(config);
  }

  public delete<K extends keyof Configuration>(key: K) {
    this.ensureExists();
    const config = this.get();
    delete config[key];
    this.replace(config);
  }

  public deleteAny(key: string) {
    this.ensureExists();
    const config = this.get();
    delete config[key];
    this.replace(config);
  }

  private get configPath() {
    return join(this.configDir, 'config.json');
  }

  private ensureExists() {
    const exists = pathExistsSync(this.configPath);
    if (!exists) {
      createFileSync(this.configPath);
      writeJSONSync(this.configPath, DefaultConfig);
    }
  }
}

export const DefaultConfig: Configuration = {
  version: CurrentSchemaVersion,
  environment: DEFAULT_ENVIRONMENT,
  region: DEFAULT_REGION,
  organization: '',
  analyticsEnabled: undefined,
  accessToken: undefined,
  anonymous: undefined,
};
