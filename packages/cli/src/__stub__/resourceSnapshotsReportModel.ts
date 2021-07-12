import {
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  ResourceSnapshotsReportType,
} from '@coveord/platform-client';

export const getReportWithNoProcessedResources = (
  snapshotId: string,
  type: ResourceSnapshotsReportType
): ResourceSnapshotsReportModel => ({
  id: snapshotId,
  type: type,
  updatedDate: 1622555847000,
  resourcesProcessed: 0,
  status: ResourceSnapshotsReportStatus.Completed,
  resultCode: ResourceSnapshotsReportResultCode.Success,
  resourceOperations: {
    EXTENSION: {
      resourcesCreated: 0,
      resourcesUpdated: 0,
      resourcesRecreated: 0,
      resourcesDeleted: 0,
      resourcesInError: 0,
      resourcesUnchanged: 0,
    },
    FIELD: {
      resourcesCreated: 0,
      resourcesUpdated: 0,
      resourcesRecreated: 0,
      resourcesDeleted: 0,
      resourcesInError: 0,
      resourcesUnchanged: 0,
    },
  },
  resourceOperationResults: {},
});

export const getReportWithoutChanges = (
  snapshotId: string,
  type: ResourceSnapshotsReportType
): ResourceSnapshotsReportModel => ({
  id: snapshotId,
  type: type,
  updatedDate: 1622555847000,
  resourcesProcessed: 12,
  status: ResourceSnapshotsReportStatus.Completed,
  resultCode: ResourceSnapshotsReportResultCode.Success,
  resourceOperations: {
    EXTENSION: {
      resourcesCreated: 0,
      resourcesUpdated: 0,
      resourcesRecreated: 0,
      resourcesDeleted: 0,
      resourcesInError: 0,
      resourcesUnchanged: 8,
    },
    FIELD: {
      resourcesCreated: 0,
      resourcesUpdated: 0,
      resourcesRecreated: 0,
      resourcesDeleted: 0,
      resourcesInError: 0,
      resourcesUnchanged: 4,
    },
  },
  resourceOperationResults: {},
});

export const getPendingReport = (
  snapshotId: string,
  type: ResourceSnapshotsReportType
): ResourceSnapshotsReportModel => ({
  id: snapshotId,
  type: type,
  updatedDate: 1622555847000,
  resourcesProcessed: 0,
  status: ResourceSnapshotsReportStatus.InProgress,
  resultCode: ResourceSnapshotsReportResultCode.Success,
  resourceOperations: {},
  resourceOperationResults: {},
});

export const getSuccessReport = (
  snapshotId: string,
  type: ResourceSnapshotsReportType
): ResourceSnapshotsReportModel => ({
  id: snapshotId,
  type: type,
  updatedDate: 1622555847000,
  resourcesProcessed: 5,
  status: ResourceSnapshotsReportStatus.Completed,
  resultCode: ResourceSnapshotsReportResultCode.Success,
  resourceOperations: {
    EXTENSION: {
      resourcesCreated: 1,
      resourcesUpdated: 1,
      resourcesRecreated: 0,
      resourcesDeleted: 2,
      resourcesInError: 0,
      resourcesUnchanged: 0,
    },
    FIELD: {
      resourcesCreated: 0,
      resourcesUpdated: 1,
      resourcesRecreated: 0,
      resourcesDeleted: 0,
      resourcesInError: 0,
      resourcesUnchanged: 0,
    },
    FILTER: {
      resourcesCreated: 0,
      resourcesUpdated: 0,
      resourcesRecreated: 0,
      resourcesDeleted: 0,
      resourcesInError: 0,
      resourcesUnchanged: 0,
    },
  },
  resourceOperationResults: {},
});

export const getErrorReport = (
  snapshotId: string,
  type: ResourceSnapshotsReportType
): ResourceSnapshotsReportModel => ({
  id: snapshotId,
  type: type,
  updatedDate: 1622555847000,
  resourcesProcessed: 11,
  status: ResourceSnapshotsReportStatus.Completed,
  resultCode: ResourceSnapshotsReportResultCode.ResourcesInError,
  resourceOperations: {
    EXTENSION: {
      resourcesCreated: 1,
      resourcesUpdated: 0,
      resourcesRecreated: 0,
      resourcesDeleted: 2,
      resourcesInError: 0,
      resourcesUnchanged: 0,
    },
    FIELD: {
      resourcesCreated: 0,
      resourcesUpdated: 1,
      resourcesRecreated: 0,
      resourcesDeleted: 0,
      resourcesInError: 7,
      resourcesUnchanged: 0,
    },
  },
  resourceOperationResults: {
    FIELD: {
      foo_4VNj5ds5: ['RESOURCE_ALREADY_EXISTS: Field foo already exists.'],
      bar_4VNj5ds5: ['RESOURCE_ALREADY_EXISTS: Field bar already exists.'],
      dsads_4VNj5ds5: ['RESOURCE_ALREADY_EXISTS: Field dsads already exists.'],
      fdww_4VNj5ds5: ['RESOURCE_ALREADY_EXISTS: Field fdww already exists.'],
      csad_4VNj5ds5: ['RESOURCE_ALREADY_EXISTS: Field csad already exists.'],
      hjkd_4VNj5ds5: ['RESOURCE_ALREADY_EXISTS: Field hjkd already exists.'],
      fdasf_4VNj5ds5: ['RESOURCE_ALREADY_EXISTS: Field fdasf already exists.'],
    },
  },
});
