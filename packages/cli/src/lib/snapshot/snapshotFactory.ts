import {Snapshot} from './snapshot';

export class SnapshotFactory {
  async createFromZip(
    pathToZip: string,
    developerNotes: string
  ): Promise<Snapshot> {
    throw new Error('TODO: CDX-353: Create Zip from project');
  }

  async createFromOrg() {
    // TODO:
  }
}
