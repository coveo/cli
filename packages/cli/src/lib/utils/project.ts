import {createWriteStream, existsSync, unlinkSync} from 'fs';
import {join} from 'path';
import {AuthenticatedClient} from '../platform/authenticatedClient';
import {cli} from 'cli-ux';
import * as archiver from 'archiver';

export class Project {
  private client: AuthenticatedClient;

  constructor(private pathToProject: string) {
    this.ensureProjectCompliance();
    this.client = new AuthenticatedClient();
  }

  private get pathToTemporaryZip() {
    return join(this.pathToProject, 'snapshot.zip');
  }

  private get pathToResources() {
    return join(this.pathToProject, 'resources');
  }

  deleteTemporaryZipFile() {
    unlinkSync(this.pathToTemporaryZip);
  }

  async getSnapshotClient() {
    return await (
      await this.client.getClient()
    ).resourceSnapshot;
  }

  ensureProjectCompliance() {
    // TODO: CDX-354: add checks to ensure the project is indeed a valid project
    if (!existsSync(this.pathToResources)) {
      throw new Error('Invalid Project. TODO: better error message');
    }
  }

  async compressResources() {
    const archivePromise = () =>
      new Promise<void>((resolve, reject) => {
        const pathToTemporaryZip = this.pathToTemporaryZip;
        const outputStream = createWriteStream(pathToTemporaryZip);
        const archive = archiver('zip');

        outputStream.on('close', () => resolve());
        archive.on('error', (err) => reject(err));

        archive.pipe(outputStream);
        archive.directory(this.pathToResources, false);
        archive.finalize();
      });

    try {
      await archivePromise();
      return this.pathToTemporaryZip;
    } catch (error) {
      cli.error(error);
    }
  }
}
