import {Snapshot} from './snapshot';

export class SnapshotFactory {
  static async createFromZip(
    pathToZip: string,
    developerNotes: string
  ): Promise<Snapshot> {
    throw new Error('TODO: CDX-353: Create Zip from project');
  }

  static async createFromOrg() {
    // TODO:
  }
}
