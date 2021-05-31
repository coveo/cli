import {CreateFromFileOptions} from '@coveord/platform-client';
import {createReadStream, ReadStream} from 'fs';
import {AuthenticatedClient} from '../platform/authenticatedClient';
import {Snapshot} from './snapshot';

// TODO: CDX-357: platform-client should support zip file as stream.
// In the meantime, we pass a custom object that contains all the require parameters expected by the createFromFile method.
export interface CustomFile extends ReadStream {
  type?: string;
}

export class SnapshotFactory {
  async createFromZip(pathToZip: string, targetOrg: string): Promise<Snapshot> {
    const snapshotClient = await this.getSnapshotClient(targetOrg);
    const file: CustomFile = createReadStream(pathToZip);

    file.type = 'application/zip';

    const computedOptions: CreateFromFileOptions = {
      developerNotes: 'cli-created-from-zip',
    };

    const model = await snapshotClient.createFromFile(file, computedOptions);
    return new Snapshot(model, snapshotClient);
  }

  async createFromOrg() {
    // TODO: need 2 instances of AuthenticatedClient: one for the source org, and the other one for the destination org
  }

  private async getSnapshotClient(targetOrg: string) {
    return (
      await new AuthenticatedClient().getClient({organization: targetOrg})
    ).resourceSnapshot;
  }
}
