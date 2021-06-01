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
  static async createFromZip(
    pathToZip: string,
    developerNotes: string
  ): Promise<Snapshot> {
    const client = await new AuthenticatedClient().getClient();
    const file: CustomFile = createReadStream(pathToZip);

    file.type = 'application/zip';

    const computedOptions: CreateFromFileOptions = {
      developerNotes,
    };

    const model = await client.resourceSnapshot.createFromFile(
      file,
      computedOptions
    );
    return new Snapshot(model, client);
  }

  static async createFromOrg() {
    // TODO:
  }
}
