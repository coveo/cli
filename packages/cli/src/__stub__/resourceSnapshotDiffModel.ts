import {
  ResourceSnapshotType,
  ResourceSnapshotsReportStatus,
  SnapshotDiffModel,
} from '@coveord/platform-client';

export const getReportWithChanges = (
  snapshotId: string,
  reportId = 'some-report-id'
): SnapshotDiffModel => ({
  id: reportId,
  relativeReportId: reportId,
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
  },
});

export const getReportWithoutChanges = (
  snapshotId: string
): SnapshotDiffModel => ({
  id: 'some-report-id',
  relativeReportId: 'some-report-id',
  snapshotId,
  updatedDate: 1622555847000,
  status: ResourceSnapshotsReportStatus.Completed,
  files: {},
});

export const getPendingReport = (snapshotId: string): SnapshotDiffModel => ({
  id: 'some-report-id',
  relativeReportId: 'some-report-id',
  snapshotId,
  updatedDate: 1622555847000,
  status: ResourceSnapshotsReportStatus.Pending,
  files: {},
});
