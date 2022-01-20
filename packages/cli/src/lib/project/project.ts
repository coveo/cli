import {
  createWriteStream,
  existsSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
  rmSync,
} from 'fs';
import {extname, join} from 'path';
import {cli} from 'cli-ux';
import archiver from 'archiver';
import {InvalidProjectError} from '../errors';
import extract from 'extract-zip';
import {DotFolder, DotFolderConfig} from './dotFolder';
import {readJsonSync, writeJsonSync, WriteOptions} from 'fs-extra';

export class Project {
  public static readonly resourceFolderName = 'resources';
  public static readonly jsonFormat: WriteOptions = {spaces: '\t'};
  public constructor(private _pathToProject: string, orgId?: string) {
    if (!this.isCoveoProject) {
      this.makeCoveoProject(orgId);
    }
  }

  public async refresh(projectContent: Blob) {
    const buffer = await projectContent.arrayBuffer();
    const view = new DataView(buffer);
    writeFileSync(this.temporaryZipPath, view);
    await extract(this.temporaryZipPath, {dir: this.resourcePath});
    this.formatResourceFiles();
    this.deleteTemporaryZipFile();
  }

  public reset() {
    if (this.isResourcesProject) {
      rmSync(Project.resourceFolderName, {recursive: true, force: true});
    }
  }

  private formatResourceFiles(dirPath = this.resourcePath) {
    const files = readdirSync(dirPath, {withFileTypes: true});
    files.forEach((file) => {
      const filePath = join(dirPath, file.name);
      if (file.isDirectory()) {
        this.formatResourceFiles(filePath);
        return;
      }
      if (file.isFile() && extname(filePath) === '.json') {
        const content = readJsonSync(filePath);
        writeJsonSync(filePath, content, Project.jsonFormat);
      }
    });
  }

  public deleteTemporaryZipFile() {
    if (existsSync(this.temporaryZipPath)) {
      unlinkSync(this.temporaryZipPath);
    }
  }

  private ensureProjectCompliance() {
    if (!this.isResourcesProject) {
      throw new InvalidProjectError(
        this._pathToProject,
        'Does not contain any resources folder'
      );
    }
    if (!this.isCoveoProject) {
      throw new InvalidProjectError(
        this._pathToProject,
        'Does not contain any .coveo folder'
      );
    }
  }

  public async compressResources() {
    try {
      this.ensureProjectCompliance();
      await new Promise<void>((resolve, reject) => {
        const outputStream = createWriteStream(this.temporaryZipPath);
        const archive = archiver('zip');

        outputStream.on('close', () => resolve());
        archive.on('error', (err) => reject(err));

        archive.pipe(outputStream);
        archive.directory(this.resourcePath, false);
        archive.finalize();
      });
      return this.temporaryZipPath;
    } catch (error) {
      cli.error(error as string | Error);
    }
  }

  public get pathToProject() {
    return this._pathToProject;
  }

  private get temporaryZipPath() {
    return join(this._pathToProject, 'snapshot.zip');
  }

  public get resourcePath() {
    return join(this._pathToProject, Project.resourceFolderName);
  }

  public contains(fileName: string) {
    return existsSync(join(this.pathToProject, fileName));
  }

  private get isCoveoProject() {
    return this.contains(DotFolder.hiddenFolderName);
  }

  private get isResourcesProject() {
    return this.contains(Project.resourceFolderName);
  }

  private makeCoveoProject(orgId?: string) {
    const dotFolder = new DotFolder(this.pathToProject);
    new DotFolderConfig(dotFolder, orgId);
  }
}
