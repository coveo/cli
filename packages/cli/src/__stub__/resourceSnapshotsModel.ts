import {
  ResourceSnapshotsModel,
  ResourceSnapshotsReportModel,
} from '@coveord/platform-client';

export const getDummySnapshotModel = (
  orgId: string,
  snapshotId: string,
  reports: ResourceSnapshotsReportModel[] = []
): ResourceSnapshotsModel => ({
  id: snapshotId,
  createdBy: 'user@coveo.com',
  createdDate: 1622555047116,
  targetId: orgId,
  developerNote: 'hello',
  reports: reports,
  synchronizationReports: [],
  contentSummary: {EXTENSION: 1, FIELD: 11},
});
