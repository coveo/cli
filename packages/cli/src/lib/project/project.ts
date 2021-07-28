import {createWriteStream, existsSync, unlinkSync, writeFileSync} from 'fs';
import {join} from 'path';
import {cli} from 'cli-ux';
import archiver from 'archiver';
import {InvalidProjectError} from '../errors';
import extract from 'extract-zip';
import {DotFolder, DotFolderConfig} from './dotFolder';

export class Project {
  private static readonly resourceFolderName = 'resources';
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
    return join(this.pathToProject, Project.resourceFolderName);
  }

  private get isCoveoProject() {
    return this.contains(DotFolder.hiddenFolderName);
  }

  private get isResourcesProject() {
    return this.contains(Project.resourceFolderName);
  }

  private makeCoveoProject() {
    const dotFolder = new DotFolder(this.pathToProject);
    new DotFolderConfig(dotFolder);
  }
}
