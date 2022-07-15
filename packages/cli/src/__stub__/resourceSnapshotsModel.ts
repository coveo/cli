import {ResourceSnapshotsModel} from '@coveord/platform-client';

export const getDummySnapshotModel = (
  orgId: string,
  snapshotId: string,
  {
    reports = [],
    diffGenerationReports = [],
  }: Partial<ResourceSnapshotsModel> = {}
): ResourceSnapshotsModel => ({
  id: snapshotId,
  createdBy: 'user@coveo.com',
  createdDate: 1622555047116,
  targetId: orgId,
  developerNote: 'hello',
  reports,
  diffGenerationReports,
  synchronizationReports: [],
  contentSummary: {EXTENSION: 1, FIELD: 11},
});
