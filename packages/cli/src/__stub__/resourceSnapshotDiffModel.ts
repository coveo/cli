import {
  ResourceSnapshotType,
  ResourceSnapshotsReportStatus,
  SnapshotDiffModel,
  SnapshotDiffFileModel,
} from '@coveord/platform-client';

export const getReportWithChanges = (
  snapshotId: string
): SnapshotDiffModel => ({
  id: 'some-report-id',
  relativeReportId: 'some-report-id',
  snapshotId,
  updatedDate: 1622555847000,
  status: ResourceSnapshotsReportStatus.Completed,
  files: {
    [ResourceSnapshotType.extension]: {
      url: 'download-url-1',
      numberOfLines: 1234, // we don't care about these
      urlExpiration: 1234, // we don't care about these
    },
    [ResourceSnapshotType.field]: {
      url: 'download-url-2',
      numberOfLines: 1234, // we don't care about these
      urlExpiration: 1234, // we don't care about these
    },
  } as Record<ResourceSnapshotType, SnapshotDiffFileModel>, // TODO: remove once CDX-1076 is merged
});

export const getReportWithoutChanges = (
  snapshotId: string
): SnapshotDiffModel => ({
  id: 'some-report-id',
  relativeReportId: 'some-report-id',
  snapshotId,
  updatedDate: 1622555847000,
  status: ResourceSnapshotsReportStatus.Completed,
  files: {} as Record<ResourceSnapshotType, SnapshotDiffFileModel>, // TODO: remove once CDX-1076 is merged,
});

export const getPendingReport = (snapshotId: string): SnapshotDiffModel => ({
  id: 'some-report-id',
  relativeReportId: 'some-report-id',
  snapshotId,
  updatedDate: 1622555847000,
  status: ResourceSnapshotsReportStatus.Pending,
  files: {} as Record<ResourceSnapshotType, SnapshotDiffFileModel>, // TODO: remove once CDX-1076 is merged,
});
