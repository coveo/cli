import {createWriteStream, existsSync, unlinkSync} from 'fs';
import {join} from 'path';
import {cli} from 'cli-ux';
import * as archiver from 'archiver';

export class Project {
  constructor(private pathToProject: string) {
    this.ensureProjectCompliance();
  }

  public deleteTemporaryZipFile() {
    unlinkSync(this.pathToTemporaryZip);
  }

  public ensureProjectCompliance() {
    /*
     * TODO: CDX-354: add checks to ensure the project is indeed a valid project
     * e.g. * Check if path to resources is a folder
     *      * Check if the root has a valid config file
     */

    if (!existsSync(this.pathToResources)) {
      throw new Error('Invalid Project. TODO: better error message');
    }
  }

  public async compressResources() {
    try {
      await new Promise<void>((resolve, reject) => {
        const pathToTemporaryZip = this.pathToTemporaryZip;
        const outputStream = createWriteStream(pathToTemporaryZip);
        const archive = archiver('zip');

        outputStream.on('close', () => resolve());
        archive.on('error', (err) => reject(err));

        archive.pipe(outputStream);
        archive.directory(this.pathToResources, false);
        archive.finalize();
      });
      return this.pathToTemporaryZip;
    } catch (error) {
      cli.error(error);
    }
  }

  private get pathToTemporaryZip() {
    return join(this.pathToProject, 'snapshot.zip');
  }

  private get pathToResources() {
    return join(this.pathToProject, 'resources');
  }
}
