import {Region} from '@coveord/platform-client';
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

export interface BaseConfiguration {
  version: string;
  region: Region;
  environment: PlatformEnvironment;
  organization: string;
  analyticsEnabled: boolean | undefined;
  accessToken: string | undefined;
  /**
   * The Amplitude Session ID; that ID is the session's start time in milliseconds since epoch.
   * For more information on how Amplitude tracks sessions, visit https://help.amplitude.com/hc/en-us/articles/115002323627-Tracking-sessions-in-Amplitude
   */
  amplitudeSessionID?: number | undefined;
  /**
   * The time in milliseconds of the last analytics event that was fired.
   * This value is used for the session ID computation
   */
  lastEventLoggedTime?: number | undefined;
  anonymous?: boolean | undefined;
}

interface additionalConfiguration {
  [k: string]: unknown;
}
export type Configuration = BaseConfiguration & additionalConfiguration;

export class Config {
  public static readonly CurrentSchemaVersion = '1.0.0';
  public static userFacingConfigKeys: (keyof BaseConfiguration)[] = [
    'environment',
    'organization',
    'region',
    'analyticsEnabled',
  ];
  public constructor(
    private configDir: string,
    private error = console.error
  ) {}

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
        this.error(
          dedent`
            The configuration at ${this.configPath} is not compatible with this version of the CLI:
            ${e.message}`
        );
      } else {
        this.error(`Error while reading configuration at ${this.configPath}`);
      }
      this.replace(DefaultConfig);
      this.error(
        `Configuration has been reset to default value: ${JSON.stringify(
          DefaultConfig
        )}`
      );
      return DefaultConfig;
    }
  }

  private isSettingVersionInRange(content: Configuration) {
    return satisfies(content.version, `^${Config.CurrentSchemaVersion}`);
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
  version: Config.CurrentSchemaVersion,
  environment: DEFAULT_ENVIRONMENT,
  region: DEFAULT_REGION,
  organization: '',
  analyticsEnabled: undefined,
  accessToken: undefined,
  anonymous: undefined,
};
