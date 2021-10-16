import {ResourceSnapshotsReportType} from '@coveord/platform-client';
import {
  getReportWithoutChanges,
  getSuccessReport,
} from '../../__stub__/resourceSnapshotsReportModel';
import {fancyIt} from '../../__test__/it';
import {ReportViewerResourceReportModel} from './reportPreviewer/reportPreviewerDataModels';
import {SnapshotReporter} from './snapshotReporter';

describe('SnapshotReporter', () => {
  describe('when the report only contains unchanged resources', () => {
    const noChangeReport = getReportWithoutChanges(
      'snapshot-no-change',
      ResourceSnapshotsReportType.DryRun
    );
    const noChangeReporter = new SnapshotReporter(noChangeReport);

    fancyIt()('#hasChangedResources should return false', () => {
      expect(noChangeReporter.hasChangedResources()).toEqual(false);
    });

    fancyIt()(
      '#getChangedResources should return the list of changed resources',
      () => {
        expect(
          noChangeReporter.getChangedResources([
            'resourcesCreated',
            'resourcesUpdated',
            'resourcesRecreated',
            'resourcesDeleted',
          ])
        ).toEqual([]);
      }
    );

    fancyIt()('#isSuccessReport should return true', () => {
      expect(noChangeReporter.isSuccessReport()).toEqual(true);
    });
  });

  describe('when the report contains changes', () => {
    const successReport = getSuccessReport(
      'snapshot-with-change',
      ResourceSnapshotsReportType.DryRun
    );
    const successReporter = new SnapshotReporter(successReport);

    fancyIt()(
      '#getOperationTypeTotalCount should return 2 resources to update',
      () => {
        expect(
          successReporter.getOperationTypeTotalCount('resourcesUpdated')
        ).toEqual(2);
      }
    );

    fancyIt()(
      '#getOperationTypeTotalCount should return 1 resource to create',
      () => {
        expect(
          successReporter.getOperationTypeTotalCount('resourcesCreated')
        ).toEqual(1);
      }
    );

    fancyIt()(
      '#getOperationTypeTotalCount should return 0 resource to recreate',
      () => {
        expect(
          successReporter.getOperationTypeTotalCount('resourcesRecreated')
        ).toEqual(0);
      }
    );

    fancyIt()('#hasChangedResources should return true', () => {
      expect(successReporter.hasChangedResources()).toEqual(true);
    });

    fancyIt()(
      '#getChangedResources should return the list of changed resources',
      () => {
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
      }
    );

    fancyIt()('#isSuccessReport should return true', () => {
      expect(successReporter.isSuccessReport()).toEqual(true);
    });
  });
});
