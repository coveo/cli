import type {ResourceSnapshotType} from '@coveord/platform-client';

export type SnapshotPullModelResourceType =
  | ResourceSnapshotType.extension
  | ResourceSnapshotType.field
  | ResourceSnapshotType.mlModel
  | ResourceSnapshotType.queryPipeline
  | ResourceSnapshotType.searchPage
  | ResourceSnapshotType.subscription;

export type SnapshotPullModelResources = Partial<
  Record<SnapshotPullModelResourceType, Array<string>>
>;

export interface SnapshotPullModel {
  resources: SnapshotPullModelResources;
  options?: {
    includeChildrenResources?: boolean;
  };
}
