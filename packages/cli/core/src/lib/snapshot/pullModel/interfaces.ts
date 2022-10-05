import {ResourceSnapshotExportConfigurationModel} from '@coveo/platform-client';

export type SnapshotPullModelResources =
  ResourceSnapshotExportConfigurationModel['resourcesToExport'];

export interface SnapshotPullModel {
  resourcesToExport: SnapshotPullModelResources;
  orgId?: string;
  includeChildrenResources?: boolean;
}
