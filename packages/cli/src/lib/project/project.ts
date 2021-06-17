import {createWriteStream, existsSync, unlinkSync} from 'fs';
import {join} from 'path';
import {cli} from 'cli-ux';
import archiver from 'archiver';

export class Project {
  public constructor(private pathToProject: string) {
    this.ensureProjectCompliance();
  }

  public deleteTemporaryZipFile() {
    unlinkSync(this.temporaryZipPath);
  }

  public ensureProjectCompliance() {
    /*
     * TODO: CDX-354: add checks to ensure the project is indeed a valid project
     * e.g. * Check if path to resources is a folder
     *      * Check if the root has a valid config file
     */

    if (!existsSync(this.resourcesPath)) {
      throw new Error('Invalid Project. TODO: better error message');
    }
  }

  public async compressResources() {
    try {
      await new Promise<void>((resolve, reject) => {
        const outputStream = createWriteStream(this.temporaryZipPath);
        const archive = archiver('zip');

        outputStream.on('close', () => resolve());
        archive.on('error', (err) => reject(err));

        archive.pipe(outputStream);
        archive.directory(this.resourcesPath, false);
        archive.finalize();
      });
      return this.temporaryZipPath;
    } catch (error) {
      cli.error(error);
    }
  }

  private get temporaryZipPath() {
    return join(this.pathToProject, 'snapshot.zip');
  }

  public get resourcesPath() {
    return join(this.pathToProject, 'resources');
  }
}
