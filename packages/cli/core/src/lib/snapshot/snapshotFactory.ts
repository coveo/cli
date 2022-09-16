import {
  CreateFromFileOptions,
  ResourceSnapshotsReportType,
  ResourceSnapshotSupportedFileTypes,
  SnapshotAccessType,
} from '@coveord/platform-client';
import {readFileSync} from 'fs';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {SnapshotPullModelResources} from './pullModel/interfaces';
import {Snapshot, WaitUntilDoneOptions} from './snapshot';
import {starSpinner} from '@coveo/cli-commons/utils/ux';
import {isSubset} from '../utils/list';

export class SnapshotFactory {
  public static async createFromZip(
    pathToZip: string,
    targetOrg: string,
    options?: WaitUntilDoneOptions
  ): Promise<Snapshot> {
    // TODO: figure out IF access valition is required here
    const client = await this.getClient(targetOrg);
    const file = readFileSync(pathToZip);

    const computedOptions: CreateFromFileOptions = {
      developerNotes: 'cli-created-from-zip',
    };

    const model = await client.resourceSnapshot.createFromBuffer(
      file,
      ResourceSnapshotSupportedFileTypes.ZIP,
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
    ////////////////////////////////////////////////////////////
    starSpinner('Validating snapshot access');
    const {allowed} = await client.resourceSnapshot.validateAccess(snapshotId, {
      snapshotAccessType: SnapshotAccessType.Read, //TODO: not sure quite right
    });

    if (!allowed) {
      throw 'TODO: show a mesage explaining why the user does not have access to the snapshot';
    }
    ////////////////////////////////////////////////////////////

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
    ////////////////////////////////////////////////////////////
    starSpinner('Validating resource access');
    const allowedResources = await client.resourceSnapshot.listResourceAccess();
    const isAllowed = isSubset(
      Object.keys(resourcesToExport),
      allowedResources
    );
    if (!isAllowed) {
      throw 'TODO: missing resources privileges';
    }
    ////////////////////////////////////////////////////////////
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
