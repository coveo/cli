import type {ResourceSnapshotType} from '@coveord/platform-client';

type SnapshotPullModelResourceType =
  | ResourceSnapshotType.extension
  | ResourceSnapshotType.field
  | ResourceSnapshotType.mlModel
  | ResourceSnapshotType.queryPipeline
  | ResourceSnapshotType.searchPage
  | ResourceSnapshotType.source
  | ResourceSnapshotType.subscription;

type SnapshotPullModelResources = Partial<
  Record<SnapshotPullModelResourceType, Array<string>>
>;

export interface SnapshotPullModel {
  resources: SnapshotPullModelResources;
  options?: {
    includeChildrenResources?: boolean;
  };
}
