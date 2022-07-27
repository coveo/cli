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
): ResourceSnapshotsReportModel => {
  const buildOperationResultError = (field: string) => ({
    resultCode: 'RESOURCE_ALREADY_EXISTS',
    message: `Field ${field} already exists.`,
  });

  return {
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
        foo_4VNj5ds5: [buildOperationResultError('foo')],
        bar_4VNj5ds5: [buildOperationResultError('bar')],
        dsads_4VNj5ds5: [buildOperationResultError('dsads')],
        fdww_4VNj5ds5: [buildOperationResultError('fdww')],
        csad_4VNj5ds5: [buildOperationResultError('csad')],
        hjkd_4VNj5ds5: [buildOperationResultError('hjkd')],
        fdasf_4VNj5ds5: [buildOperationResultError('fdasf')],
      },
    },
  };
};

export const getMissingVaultEntryReport = (
  snapshotId: string,
  type: ResourceSnapshotsReportType
): ResourceSnapshotsReportModel => {
  const buildInvalidPlaceholderReportOperationResult = (field: string) => ({
    resultCode: 'INVALID_PLACEHOLDER',
    message: `The vault entry referenced by {{ VAULT.${field}_4VNj5ds5-configuration.userIdentities.UserIdentity.password }} could not be found in the vault.`,
  });
  return {
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
        foo_4VNj5ds5: [buildInvalidPlaceholderReportOperationResult('foo')],
        bar_4VNj5ds5: [buildInvalidPlaceholderReportOperationResult('bar')],
        dsads_4VNj5ds5: [buildInvalidPlaceholderReportOperationResult('dsads')],
        fdww_4VNj5ds5: [buildInvalidPlaceholderReportOperationResult('fdww')],
        csad_4VNj5ds5: [buildInvalidPlaceholderReportOperationResult('csad')],
        hjkd_4VNj5ds5: [buildInvalidPlaceholderReportOperationResult('hjkd')],
        fdasf_4VNj5ds5: [buildInvalidPlaceholderReportOperationResult('fdasf')],
      },
    },
  };
};
