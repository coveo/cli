import {
  CreateFromFileOptions,
  ResourceSnapshotsReportType,
  ResourceSnapshotSupportedFileTypes,
  ResourceType,
} from '@coveord/platform-client';
import {readFileSync} from 'fs';
import {AuthenticatedClient} from '../platform/authenticatedClient';
import {Snapshot} from './snapshot';

export class SnapshotFactory {
  public static async createFromZip(
    pathToZip: string,
    targetOrg: string
  ): Promise<Snapshot> {
    const client = await this.getClient(targetOrg);
    const file = readFileSync(pathToZip);

    const computedOptions: CreateFromFileOptions = {
      developerNotes: 'cli-created-from-zip',
    };

    const model = await client.resourceSnapshot.createFromFile(
      file,
      ResourceSnapshotSupportedFileTypes.ZIP,
      computedOptions
    );
    const snapshot = new Snapshot(model, client);

    await snapshot.waitUntilDone({
      operationToWaitFor: ResourceSnapshotsReportType.CreateSnapshot,
    });

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

  public static async createFromOrg(
    resourceTypesToExport: ResourceType[],
    targetOrg: string
  ) {
    const client = await this.getClient(targetOrg);
    const resourcesToExport: Partial<Record<ResourceType, string[]>> = {};
    resourceTypesToExport.forEach((currentType) => {
      resourcesToExport[currentType] = ['*'];
    });

    const model = await client.resourceSnapshot.createFromOrganization(
      {resourcesToExport},
      {includeChildrenResources: true, developerNotes: 'Created by Coveo-CLI'}
    );

    const snapshot = new Snapshot(model, client);

    await snapshot.waitUntilDone({
      operationToWaitFor: ResourceSnapshotsReportType.CreateSnapshot,
    });

    return snapshot;
  }

  private static async getClient(targetOrg: string) {
    return await new AuthenticatedClient().getClient({organization: targetOrg});
  }
}
