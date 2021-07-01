import {
  CreateFromFileOptions,
  ResourceSnapshotsReportType,
} from '@coveord/platform-client';
import {createReadStream, ReadStream} from 'fs';
import {AuthenticatedClient} from '../platform/authenticatedClient';
import {Snapshot} from './snapshot';

// TODO: CDX-357: platform-client should support zip file as stream.
// In the meantime, we pass a custom object that contains all the require parameters expected by the createFromFile method.
export interface CustomFile extends ReadStream {
  type?: string;
}

export class SnapshotFactory {
  public static async createFromZip(
    pathToZip: string,
    targetOrg: string
  ): Promise<Snapshot> {
    const client = await this.getClient(targetOrg);
    const file: CustomFile = createReadStream(pathToZip);

    file.type = 'application/zip';

    const computedOptions: CreateFromFileOptions = {
      developerNotes: 'cli-created-from-zip',
    };

    const model = await client.resourceSnapshot.createFromFile(
      file,
      computedOptions
    );
    const snapshot = new Snapshot(model, client);

    await snapshot.waitUntilDone({
      operationToWaitFor: ResourceSnapshotsReportType.CreateSnapshot,
    });

    return snapshot;
  }

  public static async createFromExistingSnapshot(
    snapshotId: string,
    targetOrg: string
  ) {
    const client = await this.getClient(targetOrg);
    const model = await client.resourceSnapshot.get(snapshotId, {
      includeReports: true,
    });
    return new Snapshot(model, client);
  }

  public static async createFromOrg() {
    // TODO: need 2 instances of AuthenticatedClient: one for the source org, and the other one for the destination org
  }

  private static async getClient(targetOrg: string) {
    return await new AuthenticatedClient().getClient({organization: targetOrg});
  }
}
