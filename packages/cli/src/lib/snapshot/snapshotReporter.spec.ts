import {ResourceSnapshotsReportType} from '@coveord/platform-client';
import exp from 'constants';
import {
  getErrorReport,
  getMissingVaultEntryReport,
  getReportWithoutChanges,
  getSuccessReport,
} from '../../__stub__/resourceSnapshotsReportModel';
import {fancyIt} from '../../__test__/it';
import {
  ReportViewerResourceReportModel,
  SnapshotReportStatus,
} from './reportPreviewer/reportPreviewerDataModels';
import {SnapshotReporter} from './snapshotReporter';

function getFakeHandler() {
  const fakeHandler = jest.fn();
  const applySpy = jest.fn();
  fakeHandler.apply = applySpy;
  return {fakeHandler, applySpy};
}

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

    fancyIt()(
      '#handleReport should call the `NO_CHANGES` report handler with the reporter as this',
      async () => {
        const {fakeHandler, applySpy} = getFakeHandler();
        noChangeReporter.setReportHandler(
          SnapshotReportStatus.NO_CHANGES,
          fakeHandler
        );

        await noChangeReporter.handleReport();
        expect(applySpy).toBeCalledTimes(1);
        expect(applySpy).toBeCalledWith(noChangeReporter);
      }
    );

    it.each([SnapshotReportStatus.NO_CHANGES, SnapshotReportStatus.SUCCESS])(
      '#handleReport should call the `%s` report handler with the reporter as this',
      async (status: SnapshotReportStatus) => {
        const {fakeHandler, applySpy} = getFakeHandler();
        noChangeReporter.setReportHandler(status, fakeHandler);

        await noChangeReporter.handleReport();
        expect(applySpy).toBeCalledTimes(1);
        expect(applySpy).toBeCalledWith(noChangeReporter);
      }
    );

    it.each([
      SnapshotReportStatus.ERROR,
      SnapshotReportStatus.MISSING_VAULT_ENTRIES,
    ])(
      '#handleReport should not call the `%s` report handler with the reporter as this',
      async (status: SnapshotReportStatus) => {
        const {fakeHandler, applySpy} = getFakeHandler();
        noChangeReporter.setReportHandler(status, fakeHandler);

        await noChangeReporter.handleReport();
        expect(applySpy).toBeCalledTimes(0);
      }
    );

    fancyIt()(
      '#handleReport should call the `SUCCESS` report handler with the reporter as this',
      async () => {
        const {fakeHandler, applySpy} = getFakeHandler();
        noChangeReporter.setReportHandler(
          SnapshotReportStatus.SUCCESS,
          fakeHandler
        );

        await noChangeReporter.handleReport();
        expect(applySpy).toBeCalledTimes(1);
        expect(applySpy).toBeCalledWith(noChangeReporter);
      }
    );
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

    it.each([SnapshotReportStatus.SUCCESS])(
      '#handleReport should call the `%s` report handler with the reporter as this',
      async (status: SnapshotReportStatus) => {
        const {fakeHandler, applySpy} = getFakeHandler();
        successReporter.setReportHandler(status, fakeHandler);

        await successReporter.handleReport();
        expect(applySpy).toBeCalledTimes(1);
        expect(applySpy).toBeCalledWith(successReporter);
      }
    );

    it.each([
      SnapshotReportStatus.ERROR,
      SnapshotReportStatus.MISSING_VAULT_ENTRIES,
      SnapshotReportStatus.NO_CHANGES,
    ])(
      '#handleReport should not call the `%s` report handler with the reporter as this',
      async (status: SnapshotReportStatus) => {
        const {fakeHandler, applySpy} = getFakeHandler();
        successReporter.setReportHandler(status, fakeHandler);

        await successReporter.handleReport();
        expect(applySpy).toBeCalledTimes(0);
      }
    );
  });

  describe('when the report contains missing vault entries', () => {
    const missingVaultEntryReport = getMissingVaultEntryReport(
      'snapshot-with-change',
      ResourceSnapshotsReportType.DryRun
    );
    let missingVaultEntryReporter: SnapshotReporter;

    beforeEach(() => {
      missingVaultEntryReporter = new SnapshotReporter(missingVaultEntryReport);
    });

    it.each([SnapshotReportStatus.MISSING_VAULT_ENTRIES])(
      '#handleReport should call the `%s` report handler with the reporter as this',
      async (status: SnapshotReportStatus) => {
        const {fakeHandler, applySpy} = getFakeHandler();
        missingVaultEntryReporter.setReportHandler(status, fakeHandler);

        await missingVaultEntryReporter.handleReport();
        expect(applySpy).toBeCalledTimes(1);
        expect(applySpy).toBeCalledWith(missingVaultEntryReporter);
      }
    );

    it('[get]-missingVaultEntries should be empty prior to handling', () => {
      expect(
        Array.from(missingVaultEntryReporter.missingVaultEntries).length
      ).toBe(0);
    });

    it('[get]-missingVaultEntries should be properly extracted after the handling', async () => {
      await missingVaultEntryReporter.handleReport();

      expect(
        Array.from(missingVaultEntryReporter.missingVaultEntries).join(',')
      ).toBe(
        [
          'VAULT.foo_4VNj5ds5-configuration.userIdentities.UserIdentity.password',
          'FIELD',
          'VAULT.bar_4VNj5ds5-configuration.userIdentities.UserIdentity.password',
          'FIELD',
          'VAULT.dsads_4VNj5ds5-configuration.userIdentities.UserIdentity.password',
          'FIELD',
          'VAULT.fdww_4VNj5ds5-configuration.userIdentities.UserIdentity.password',
          'FIELD',
          'VAULT.csad_4VNj5ds5-configuration.userIdentities.UserIdentity.password',
          'FIELD',
          'VAULT.hjkd_4VNj5ds5-configuration.userIdentities.UserIdentity.password',
          'FIELD',
          'VAULT.fdasf_4VNj5ds5-configuration.userIdentities.UserIdentity.password',
          'FIELD',
        ].join(',')
      );
    });
  });

  describe('when the report has resources in errors', () => {
    const resourceInErrorReport = getErrorReport(
      'snapshot-with-change',
      ResourceSnapshotsReportType.DryRun
    );
    let resourceInErrorReporter: SnapshotReporter;

    beforeEach(() => {
      resourceInErrorReporter = new SnapshotReporter(resourceInErrorReport);
    });

    it.each([SnapshotReportStatus.ERROR])(
      '#handleReport should call the `%s` report handler with the reporter as this',
      async (status: SnapshotReportStatus) => {
        const {fakeHandler, applySpy} = getFakeHandler();
        resourceInErrorReporter.setReportHandler(status, fakeHandler);

        await resourceInErrorReporter.handleReport();
        expect(applySpy).toBeCalledTimes(1);
        expect(applySpy).toBeCalledWith(resourceInErrorReporter);
      }
    );

    it('[get]-resourceInError should be empty prior to handling', () => {
      expect(resourceInErrorReporter.resourceInError.size).toBe(0);
    });

    it('[get]-resourceInErrorCount should be 0 prior to handling', () => {
      expect(resourceInErrorReporter.resourceInErrorCount).toBe(0);
    });

    it('[get]-resourceInError should be properly extracted after the handling', async () => {
      await resourceInErrorReporter.handleReport();
      const errorsJsonObject = Array.from(
        resourceInErrorReporter.resourceInError.entries()
      ).reduce<Object>((acc, [resourceType, value]) => {
        return {...acc, [resourceType]: Array.from(value)};
      }, {});
      expect(JSON.stringify(errorsJsonObject)).toBe(
        '{"FIELD":["RESOURCE_ALREADY_EXISTS: Field foo already exists.","RESOURCE_ALREADY_EXISTS: Field bar already exists.","RESOURCE_ALREADY_EXISTS: Field dsads already exists.","RESOURCE_ALREADY_EXISTS: Field fdww already exists.","RESOURCE_ALREADY_EXISTS: Field csad already exists.","RESOURCE_ALREADY_EXISTS: Field hjkd already exists.","RESOURCE_ALREADY_EXISTS: Field fdasf already exists."]}'
      );
    });

    it('[get]-resourceInError should be properly extracted after the handling', async () => {
      await resourceInErrorReporter.handleReport();
      expect(resourceInErrorReporter.resourceInErrorCount).toBe(7);
    });
  });
});
