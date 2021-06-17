import PlatformClient, {
  CreateFromFileOptions,
  ResourceSnapshotsModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  ResourceSnapshotsReportType,
  ResourceType,
} from '@coveord/platform-client';
import {createReadStream, ReadStream} from 'fs';
import {AuthenticatedClient} from '../platform/authenticatedClient';
import {Snapshot} from './snapshot';
import retry from 'async-retry';

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

    await snapshot.waitUntilOperationIsDone(
      ResourceSnapshotsReportType.CreateSnapshot
    );

    return snapshot;
  }

  public static async createFromOrg(
    resourceTypesToExport: ResourceType[],
    targetOrg: string
  ) {
    const client = await SnapshotFactory.getClient(targetOrg);
    const resourcesToExport = resourceTypesToExport.reduce(
      (resourceToExport, currentType) => {
        resourceToExport[currentType] = ['*'];
        return resourceToExport;
      },
      {} as Partial<Record<ResourceType, string[]>>
    );

    const model = await client.resourceSnapshot.createFromOrganization(
      {resourcesToExport},
      {includeChildrenResources: true, developerNotes: 'Created by Coveo-CLI'}
    );

    const snapshot = new Snapshot(model, client);

    await snapshot.waitUntilOperationIsDone(
      ResourceSnapshotsReportType.CreateSnapshot
    );

    return snapshot;
  }

  private static async getClient(targetOrg: string) {
    return await new AuthenticatedClient().getClient({organization: targetOrg});
  }
}
