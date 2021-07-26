import {createWriteStream, existsSync, unlinkSync, writeFileSync} from 'fs';
import {join} from 'path';
import {cli} from 'cli-ux';
import archiver from 'archiver';
import {InvalidProjectError} from '../errors';
import extract from 'extract-zip';
import {createFileSync, pathExistsSync, writeJSONSync} from 'fs-extra';

export class Project {
  public constructor(private pathToProject: string) {
    if (!this.isCoveoProject) {
      this.makeCoveoProject();
    }
  }

  public async refresh(projectContent: Blob) {
    const buffer = await projectContent.arrayBuffer();
    const view = new DataView(buffer);
    writeFileSync(this.pathToTemporaryZip, view);
    await extract(this.pathToTemporaryZip, {dir: this.resourcePath});
    this.deleteTemporaryZipFile();
  }

  public deleteTemporaryZipFile() {
    unlinkSync(this.pathToTemporaryZip);
  }

  private ensureProjectCompliance() {
    if (!this.isResourcesProject) {
      throw new InvalidProjectError(
        this.pathToProject,
        'Does not contain any resources folder'
      );
    }
    if (!this.isCoveoProject) {
      throw new InvalidProjectError(
        this.pathToProject,
        'Does not contain any .coveo folder'
      );
    }
  }

  public async compressResources() {
    try {
      this.ensureProjectCompliance();
      await new Promise<void>((resolve, reject) => {
        const pathToTemporaryZip = this.pathToTemporaryZip;
        const outputStream = createWriteStream(pathToTemporaryZip);
        const archive = archiver('zip');

        outputStream.on('close', () => resolve());
        archive.on('error', (err) => reject(err));

        archive.pipe(outputStream);
        archive.directory(this.resourcePath, false);
        archive.finalize();
      });
      return this.pathToTemporaryZip;
    } catch (error) {
      cli.error(error);
    }
  }

  public contains(fileName: string) {
    return existsSync(join(this.pathToProject, fileName));
  }

  private get pathToTemporaryZip() {
    return join(this.pathToProject, 'snapshot.zip');
  }

  private get resourcePath() {
    return join(this.pathToProject, 'resources');
  }

  private get isCoveoProject() {
    return this.contains(DotFolderConfig.hiddenFolderName);
  }

  private get isResourcesProject() {
    return this.contains(this.resourcePath);
  }

  private makeCoveoProject() {
    new DotFolderConfig(this.pathToProject);
  }
}

export class DotFolderConfig {
  public constructor(public owner: string) {
    this.ensureConfigExists();
  }

  public static get hiddenFolderName() {
    return '.coveo';
  }

  public static get configName() {
    return 'config.json';
  }

  private get defaultConfig() {
    return {
      version: 1,
      organization: '',
    };
  }

  private ensureConfigExists() {
    const path = join(
      this.owner.toString(),
      DotFolderConfig.hiddenFolderName,
      DotFolderConfig.configName
    );

    const exists = pathExistsSync(path);
    if (!exists) {
      createFileSync(path);
      writeJSONSync(path, this.defaultConfig);
    }
  }
}
