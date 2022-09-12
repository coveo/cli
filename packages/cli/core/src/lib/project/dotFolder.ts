import {ensureDirSync, existsSync, writeJSONSync} from 'fs-extra';
import {join} from 'path';

export class DotFolder {
  public constructor(public owner: string) {
    this.ensureFolderExists();
  }

  public static get hiddenFolderName() {
    return '.coveo';
  }

  public get path() {
    return join(this.owner.toString(), DotFolder.hiddenFolderName);
  }

  private ensureFolderExists() {
    ensureDirSync(this.path);
  }
}

export class DotFolderConfig {
  public constructor(public ownerFolder: DotFolder, orgId?: string) {
    this.ensureFileExists(orgId);
  }

  public static get configName() {
    return 'config.json';
  }

  private get defaultConfig() {
    return {
      version: 1,
      organization: '', // TODO: Needs to use that "local" config for all :config:* command that would rely on it.
    };
  }

  private ensureFileExists(orgId?: string) {
    const path = join(this.ownerFolder.path, DotFolderConfig.configName);
    if (!existsSync(path)) {
      const config = orgId
        ? {...this.defaultConfig, organization: orgId}
        : this.defaultConfig;
      writeJSONSync(path, config);
    }
  }
}
