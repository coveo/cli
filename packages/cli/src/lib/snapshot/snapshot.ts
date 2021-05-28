import {
  CreateFromFileOptions,
  ResourceSnapshotsModel,
} from '@coveord/platform-client';
import {createReadStream, ReadStream} from 'fs';
import {AuthenticatedClient} from '../platform/authenticatedClient';

// TODO: CDX-357: platform-client should support zip file as stream.
// In the meantime, we pass a custom object that contains all the require parameters expected by the createFromFile method.
export interface CustomFile extends ReadStream {
  type?: string;
}

export class Snapshot {
  private client: AuthenticatedClient;
  private lastSnapshot: ResourceSnapshotsModel | null = null;

  constructor() {
    this.client = new AuthenticatedClient();
  }

  async createSnapshotFromZip(pathToZip: string, developerNotes: string) {
    const snapshotClient = await this.getSnapshotClient();
    const file: CustomFile = createReadStream(pathToZip);

    file.type = 'application/zip';

    const computedOptions: CreateFromFileOptions = {
      developerNotes,
    };

    this.lastSnapshot = await snapshotClient.createFromFile(
      file,
      computedOptions
    );
  }

  async pushSnapshotToTarget(targetOrganisationId: string) {
    // TODO: CDX-356: Right now the snapshot will remain in the connected org. It should be sent to the destination org specified by the --target flag.
    // const snapshotClient = await this.getSnapshotClient();
    // snapshotClient.push(this.lastSnapshot?.targetId, {targetOrganisationId});
  }

  validateSnapshot(targetOrganisationId: string) {
    // TODO: CDX-358: Validate snapshot
  }

  previewSnapshot() {
    // TODO: get detailed report
    this.displayLightPreview();
    this.displayExpandedPreview();
  }

  private displayLightPreview() {
    // TODO: CDX-346 Display light preview
  }

  private displayExpandedPreview() {
    // TODO: CDX-347 Display Expanded preview
  }

  async deleteSnapshot() {
    // TODO: CDX-359: Delete snapshot once previewed
  }

  private async getSnapshotClient() {
    return (await this.client.getClient()).resourceSnapshot;
  }
}
