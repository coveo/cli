import {
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  ResourceSnapshotsReportType,
  ResourceSnapshotsSynchronizationReportModel,
} from '@coveord/platform-client';

export const getSuccessfulSynchronizationReport = () => {
  return getPlan(
    ResourceSnapshotsReportResultCode.Success,
    ResourceSnapshotsReportStatus.Completed
  );
};

export const getUnsuccessfulSynchronizationReport = () => {
  return getPlan(
    ResourceSnapshotsReportResultCode.ResourcesInError,
    ResourceSnapshotsReportStatus.Completed
  );
};

const getPlan = (
  resultCode: ResourceSnapshotsReportResultCode,
  status: ResourceSnapshotsReportStatus
): ResourceSnapshotsSynchronizationReportModel => ({
  id: 'some-id',
  synchronizationPlanId: 'some-plan-id',
  linkOperationDetails: {},
  linkOperations: {},
  resourcesProcessed: 6,
  resultCode,
  status,
  type: ResourceSnapshotsReportType.CreateSynchronizationPlan,
  updatedDate: 1630524592000,
});
