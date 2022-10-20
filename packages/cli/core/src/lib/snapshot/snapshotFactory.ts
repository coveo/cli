import {
  CreateFromFileOptions,
  ResourceSnapshotsReportType,
  ResourceSnapshotSupportedFileTypes,
  ResourceSnapshotType,
} from '@coveo/platform-client';
import {readFileSync} from 'fs';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {SnapshotPullModelResources} from './pullModel/interfaces';
import {Snapshot, WaitUntilDoneOptions} from './snapshot';
import {Project} from '../project/project';
import {ensureResourcesAccess, ensureSnapshotAccess} from './snapshotAccess';
import {Blob} from 'buffer';

export class SnapshotFactory {
  public static async createSnapshotFromProject(
    project: Project,
    targetOrg: string,
    options?: WaitUntilDoneOptions
  ): Promise<Snapshot> {
    const client = await this.getClient(targetOrg);
    await ensureResourcesAccess(client, project.resourceTypes);
    const pathToZip = await project.compressResources();
    const file = readFileSync(pathToZip);
    const blob = new Blob([file], {
      type: 'application/zip',
    });
    const computedOptions: CreateFromFileOptions = {
      developerNotes: 'cli-created-from-zip',
    };

    const model = await client.resourceSnapshot.createFromFile(
      blob,
      computedOptions
    );
    const snapshot = new Snapshot(model, client);

    await snapshot.waitUntilDone({
      operationToWaitFor: ResourceSnapshotsReportType.CreateSnapshot,
      ...options,
    });

    return snapshot;
  }

  public static async createFromExistingSnapshot(
    snapshotId: string,
    targetOrg: string,
    options?: WaitUntilDoneOptions
  ) {
    const client = await this.getClient(targetOrg);
    await ensureSnapshotAccess(client, snapshotId);
    const model = await client.resourceSnapshot.get(snapshotId, {
      includeReports: true,
    });

    const snapshot = new Snapshot(model, client);
    await snapshot.waitUntilDone(options);

    return snapshot;
  }

  public static async createFromOrg(
    resourcesToExport: SnapshotPullModelResources,
    targetOrg: string,
    options?: WaitUntilDoneOptions
  ) {
    const client = await this.getClient(targetOrg);
    const resourceTypes = Object.keys(
      resourcesToExport
    ) as ResourceSnapshotType[];
    await ensureResourcesAccess(client, resourceTypes);
    const model = await client.resourceSnapshot.createFromOrganization(
      {resourcesToExport},
      {includeChildrenResources: true, developerNotes: 'Created by Coveo-CLI'}
    );

    const snapshot = new Snapshot(model, client);

    await snapshot.waitUntilDone({
      operationToWaitFor: ResourceSnapshotsReportType.CreateSnapshot,
      ...options,
    });

    return snapshot;
  }

  private static async getClient(targetOrg: string) {
    return await new AuthenticatedClient().getClient({organization: targetOrg});
  }
}
