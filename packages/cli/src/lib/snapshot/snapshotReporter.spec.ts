import {
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  ResourceSnapshotsReportType,
} from '@coveord/platform-client';
import {ReportViewerResourceReportModel} from './reportViewer/reportViewerDataModels';
import {SnapshotReporter} from './snapshotReporter';

const getReportWithoutChanges = (
  snapshotId: string
): ResourceSnapshotsReportModel => ({
  id: snapshotId,
  updatedDate: 1622555847000,
  type: ResourceSnapshotsReportType.DryRun,
  status: ResourceSnapshotsReportStatus.Completed,
  resourcesProcessed: 12,
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

const getSuccessReport = (
  snapshotId: string
): ResourceSnapshotsReportModel => ({
  id: snapshotId,
  updatedDate: 1622555847000,
  resourcesProcessed: 5,
  type: ResourceSnapshotsReportType.DryRun,
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

describe('SnapshotReporter', () => {
  describe('when the report only contains unchanged resources', () => {
    const noChangeReport = getReportWithoutChanges('snapshot-no-change');
    const noChangeReporter = new SnapshotReporter(noChangeReport);

    it('#hasChangedResources should return false', () => {
      expect(noChangeReporter.hasChangedResources()).toEqual(false);
    });

    it('#getChangedResources should return the list of changed resources', () => {
      expect(
        noChangeReporter.getChangedResources([
          'resourcesCreated',
          'resourcesUpdated',
          'resourcesRecreated',
          'resourcesDeleted',
        ])
      ).toEqual([]);
    });

    it('#isSuccessReport should return true', () => {
      expect(noChangeReporter.isSuccessReport()).toEqual(true);
    });
  });

  describe('when the report contains changes', () => {
    const successReport = getSuccessReport('snapshot-with-change');
    const successReporter = new SnapshotReporter(successReport);

    it('#getOperationTypeTotalCount should return 2 resources to update', () => {
      expect(
        successReporter.getOperationTypeTotalCount('resourcesUpdated')
      ).toEqual(2);
    });

    it('#getOperationTypeTotalCount should return 1 resource to create', () => {
      expect(
        successReporter.getOperationTypeTotalCount('resourcesCreated')
      ).toEqual(1);
    });

    it('#getOperationTypeTotalCount should return 0 resource to recreate', () => {
      expect(
        successReporter.getOperationTypeTotalCount('resourcesRecreated')
      ).toEqual(0);
    });

    it('#hasChangedResources should return true', () => {
      expect(successReporter.hasChangedResources()).toEqual(true);
    });

    it('#getChangedResources should return the list of changed resources', () => {
      const expected: ReportViewerResourceReportModel[] = [
        {
          name: 'EXTENSION',
          operations: {
            resourcesCreated: 1,
            resourcesUpdated: 1,
            resourcesRecreated: 0,
            resourcesDeleted: 2,
            resourcesInError: 0,
            resourcesUnchanged: 0,
          },
        },
        {
          name: 'FIELD',
          operations: {
            resourcesCreated: 0,
            resourcesUpdated: 1,
            resourcesRecreated: 0,
            resourcesDeleted: 0,
            resourcesInError: 0,
            resourcesUnchanged: 0,
          },
        },
      ];
      expect(
        successReporter.getChangedResources([
          'resourcesCreated',
          'resourcesUpdated',
          'resourcesRecreated',
          'resourcesDeleted',
        ])
      ).toEqual(expect.arrayContaining(expected));
    });

    it('#isSuccessReport should return true', () => {
      expect(successReporter.isSuccessReport()).toEqual(true);
    });
  });
});
