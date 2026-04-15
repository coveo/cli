import {
  ResourceSnapshotsReportOperationModel,
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  ResourceSnapshotsReportType,
  SnapshotsReportStages,
} from '@coveo/platform-client';

const buildOperation = (
  overrides: Partial<ResourceSnapshotsReportOperationModel> = {}
): ResourceSnapshotsReportOperationModel => ({
  resourcesCreated: 0,
  resourcesCreatedNames: [],
  resourcesDeleted: 0,
  resourcesDeletedNames: [],
  resourcesInError: 0,
  resourcesInErrorNames: [],
  resourcesRecreated: 0,
  resourcesRecreatedNames: [],
  resourcesSynchronized: 0,
  resourcesSynchronizedNames: [],
  resourcesUnchanged: 0,
  resourcesUnchangedNames: [],
  resourcesUpdated: 0,
  resourcesUpdatedNames: [],
  ...overrides,
});

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
    EXTENSION: buildOperation(),
    FIELD: buildOperation(),
  },
  resourceOperationResults: {},
  stagesToExecute: [],
  startDate: 1,
  currentStage: {
    progressType: 'BINARY',
    progressValue: 2,
    stage: SnapshotsReportStages.VALIDATING_OPERATIONS,
  },
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
    EXTENSION: buildOperation({resourcesUnchanged: 8}),
    FIELD: buildOperation({resourcesUnchanged: 4}),
  },
  resourceOperationResults: {},
  stagesToExecute: [],
  startDate: 1,
  currentStage: {
    progressType: 'BINARY',
    progressValue: 2,
    stage: SnapshotsReportStages.VALIDATING_OPERATIONS,
  },
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
  stagesToExecute: [],
  startDate: 1,
  currentStage: {
    progressType: 'BINARY',
    progressValue: 2,
    stage: SnapshotsReportStages.VALIDATING_OPERATIONS,
  },
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
    EXTENSION: buildOperation({
      resourcesCreated: 1,
      resourcesUpdated: 1,
      resourcesDeleted: 2,
    }),
    FIELD: buildOperation({
      resourcesUpdated: 1,
    }),
    FILTER: buildOperation(),
  },
  resourceOperationResults: {},
  stagesToExecute: [],
  startDate: 1,
  currentStage: {
    progressType: 'BINARY',
    progressValue: 2,
    stage: SnapshotsReportStages.VALIDATING_OPERATIONS,
  },
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
      EXTENSION: buildOperation({
        resourcesCreated: 1,
        resourcesDeleted: 2,
      }),
      FIELD: buildOperation({
        resourcesUpdated: 1,
        resourcesInError: 7,
      }),
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
    stagesToExecute: [],
    startDate: 1,
    currentStage: {
      progressType: 'BINARY',
      progressValue: 2,
      stage: SnapshotsReportStages.VALIDATING_OPERATIONS,
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
      EXTENSION: buildOperation({
        resourcesCreated: 1,
        resourcesDeleted: 2,
      }),
      FIELD: buildOperation({
        resourcesUpdated: 1,
        resourcesInError: 7,
      }),
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
    stagesToExecute: [],
    startDate: 1,
    currentStage: {
      progressType: 'BINARY',
      progressValue: 2,
      stage: SnapshotsReportStages.VALIDATING_OPERATIONS,
    },
  };
};
