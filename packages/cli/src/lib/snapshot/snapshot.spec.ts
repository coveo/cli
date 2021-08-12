import {
  ResourceSnapshotsModel,
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportStatus,
  ResourceSnapshotsReportType,
  SnapshotExportContentFormat,
} from '@coveord/platform-client';
import {mocked} from 'ts-jest/utils';

import {getDummySnapshotModel} from '../../__stub__/resourceSnapshotsModel';
import {
  getErrorReport,
  getPendingReport,
  getSuccessReport,
} from '../../__stub__/resourceSnapshotsReportModel';

import {Snapshot} from './snapshot';

//#region Mocks
jest.mock('../platform/authenticatedClient');
jest.mock('fs-extra');
jest.mock('async-retry');
jest.mock('./snapshotReporter');
jest.mock('./reportPreviewer/reportPreviewer');
jest.mock('../project/project');
jest.mock('./expandedPreviewer/expandedPreviewer');

import {AuthenticatedClient} from '../platform/authenticatedClient';
import {ensureFileSync, writeJSONSync} from 'fs-extra';
import retry, {RetryFunction} from 'async-retry';
import {SnapshotReporter} from './snapshotReporter';
import {ReportViewer} from './reportPreviewer/reportPreviewer';
import {Project} from '../project/project';
import {ExpandedPreviewer} from './expandedPreviewer/expandedPreviewer';
import {join} from 'path';
import {SnapshotOperationTimeoutError} from '../errors';

const mockedRetry = mocked(retry);
const mockedExpandedPreviewer = mocked(ExpandedPreviewer, true);
const mockedProject = mocked(Project, true);
const mockedSnapshotReporter = mocked(SnapshotReporter, true);
const mockedReportViewer = mocked(ReportViewer, true);
const mockedAuthenticatedClient = mocked(AuthenticatedClient, true);
const mockedEnsureFileSync = mocked(ensureFileSync);
const mockedWriteJsonSync = mocked(writeJSONSync);
const mockedCreateSnapshotFromBuffer = jest.fn();
const mockedPushSnapshot = jest.fn();
const mockedDeleteSnapshot = jest.fn();
const mockedGetSnapshot = jest.fn();
const mockedExportSnapshot = jest.fn();
const mockedApplySnapshot = jest.fn();
const mockedDryRunSnapshot = jest.fn();
const mockedGetClient = jest.fn();
//#endregion Mocks

describe('Snapshot', () => {
  const targetOrgId = 'target-org';
  const snapshotId = 'target-org-snapshot-id';

  let snapshot: Snapshot;
  //#region MockFactories
  const getSuccessDryRunReport = (
    snapshotId: string
  ): ResourceSnapshotsReportModel =>
    getSuccessReport(snapshotId, ResourceSnapshotsReportType.DryRun);

  const getErrorDryRunReport = (
    snapshotId: string
  ): ResourceSnapshotsReportModel =>
    getErrorReport(snapshotId, ResourceSnapshotsReportType.DryRun);

  const getSuccessApplyReport = (
    snapshotId: string
  ): ResourceSnapshotsReportModel =>
    getSuccessReport(snapshotId, ResourceSnapshotsReportType.Apply);

  const getErrorApplyReport = (
    snapshotId: string
  ): ResourceSnapshotsReportModel =>
    getErrorReport(snapshotId, ResourceSnapshotsReportType.Apply);

  const doMockAuthenticatedClient = () => {
    mockedGetClient.mockImplementation(() =>
      Promise.resolve({
        resourceSnapshot: {
          createFromBuffer: mockedCreateSnapshotFromBuffer,
          push: mockedPushSnapshot,
          delete: mockedDeleteSnapshot,
          dryRun: mockedDryRunSnapshot,
          get: mockedGetSnapshot,
          export: mockedExportSnapshot,
          apply: mockedApplySnapshot,
        },
      })
    );

    mockedAuthenticatedClient.prototype.getClient.mockImplementation(
      mockedGetClient
    );
  };

  const doMockGetSnapshotWithoutError = async () => {
    const successValidateReport = getSuccessDryRunReport(snapshotId);
    const futureValidateSnapshotState = getDummySnapshotModel(
      targetOrgId,
      snapshotId,
      [successValidateReport]
    );
    const successApplyReport = getSuccessApplyReport(snapshotId);
    const futureApplySnapshotState = getDummySnapshotModel(
      targetOrgId,
      snapshotId,
      [successApplyReport]
    );

    mockedGetSnapshot
      .mockResolvedValueOnce(futureValidateSnapshotState)
      .mockResolvedValueOnce(futureApplySnapshotState);
  };

  const doMockWaitUntilDone = () => {
    const mockedWaitUntilDone = jest.fn().mockReturnValue(Promise.resolve());
    snapshot.waitUntilDone = mockedWaitUntilDone;
    return mockedWaitUntilDone;
  };

  //#endregion

  const getSnapshot = async (
    reports?: ResourceSnapshotsReportModel | ResourceSnapshotsReportModel[]
  ): Promise<[Snapshot, ResourceSnapshotsModel]> => {
    if (reports && !Array.isArray(reports)) {
      reports = [reports];
    }
    const initialSnapshotState = getDummySnapshotModel(
      targetOrgId,
      snapshotId,
      reports
    );
    return [
      new Snapshot(
        initialSnapshotState,
        await new AuthenticatedClient().getClient()
      ),
      initialSnapshotState,
    ];
  };

  beforeEach(() => {
    doMockAuthenticatedClient();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('#validate', () => {
    let mockedWaitUntilDone: jest.FunctionLike;
    let mockedDryRunReport: ResourceSnapshotsReportModel;

    beforeEach(async () => {
      mockedDryRunReport = getSuccessDryRunReport(snapshotId);
      [snapshot] = await getSnapshot(mockedDryRunReport);
      mockedWaitUntilDone = doMockWaitUntilDone();
    });

    it.each([
      [undefined, false],
      [true, true],
      [false, false],
    ])(
      'should request to dry-run the snapshot to the platform',
      async (validateParam, snapshotClientParam) => {
        await snapshot.validate(validateParam);

        expect(mockedDryRunSnapshot).toHaveBeenCalledWith(snapshotId, {
          deleteMissingResources: snapshotClientParam,
        });
      }
    );

    it('should wait for the backend-operation to complete', async () => {
      await snapshot.validate();
      await snapshot.validate(undefined, {wait: 10});

      expect(mockedWaitUntilDone).toHaveBeenNthCalledWith(1, {
        operationToWaitFor: ResourceSnapshotsReportType.DryRun,
      });
      expect(mockedWaitUntilDone).toHaveBeenNthCalledWith(2, {
        operationToWaitFor: ResourceSnapshotsReportType.DryRun,
        wait: 10,
      });
    });

    it('should create and return a SnapshotReporter of the latest report', async () => {
      const returnedReporter = await snapshot.validate();

      expect(mockedSnapshotReporter).toHaveBeenCalledTimes(1);
      expect(mockedSnapshotReporter).toHaveBeenCalledWith(mockedDryRunReport);
      expect(returnedReporter).toBe(mockedSnapshotReporter.mock.instances[0]);
    });
  });

  describe('#preview', () => {
    let someReport: ResourceSnapshotsReportModel;

    beforeEach(async () => {
      someReport = getSuccessDryRunReport(snapshotId);
      [snapshot] = await getSnapshot(someReport);
    });

    it('should display the the light preview', async () => {
      await snapshot.preview(new Project(''));

      expect(mockedSnapshotReporter).toBeCalledWith(someReport);
      expect(mockedReportViewer).toBeCalledWith(
        mockedSnapshotReporter.mock.instances[0]
      );
    });

    describe('when the latest report is succesful', () => {
      beforeEach(() => {
        mockedSnapshotReporter.mockImplementation(
          () =>
            ({
              isSuccessReport: () => true,
            } as unknown as SnapshotReporter)
        );
      });

      it.each([
        [undefined, false],
        [true, true],
        [false, false],
      ])(
        'should generate the expanded preview',
        async (previewParam, expandedPreviewerParam) => {
          const someProject = new Project('');

          await snapshot.preview(someProject, previewParam);

          expect(mockedExpandedPreviewer).toBeCalledWith(
            someReport,
            targetOrgId,
            someProject,
            expandedPreviewerParam
          );
          expect(
            mockedExpandedPreviewer.mock.instances[0].preview
          ).toHaveBeenCalled();
        }
      );
    });

    describe('when the latest report is not succesful', () => {
      beforeEach(() => {
        mockedSnapshotReporter.mockImplementation(
          () =>
            ({
              isSuccessReport: () => false,
            } as unknown as SnapshotReporter)
        );
      });

      it('should not generate the expanded preview', async () => {
        await snapshot.preview(new Project(''));

        expect(mockedExpandedPreviewer).not.toBeCalled();
      });
    });
  });

  describe('#apply', () => {
    let mockedWaitUntilDone: jest.FunctionLike;
    let mockedApplyRunReport: ResourceSnapshotsReportModel;

    beforeEach(async () => {
      mockedApplyRunReport = getSuccessApplyReport(snapshotId);
      [snapshot] = await getSnapshot(mockedApplyRunReport);
      mockedWaitUntilDone = doMockWaitUntilDone();
    });

    it.each([
      [undefined, false],
      [true, true],
      [false, false],
    ])(
      'should request to apply the snapshot to the platform',
      async (validateParam, snapshotClientParam) => {
        await snapshot.apply(validateParam);

        expect(mockedApplySnapshot).toHaveBeenCalledWith(snapshotId, {
          deleteMissingResources: snapshotClientParam,
        });
      }
    );

    it('should wait for the backend-operation to complete', async () => {
      await snapshot.apply();
      await snapshot.apply(true, {wait: 10});

      expect(mockedWaitUntilDone).toHaveBeenNthCalledWith(1, {
        operationToWaitFor: ResourceSnapshotsReportType.Apply,
      });
      expect(mockedWaitUntilDone).toHaveBeenNthCalledWith(2, {
        operationToWaitFor: ResourceSnapshotsReportType.Apply,
        wait: 10,
      });
    });

    it('should create and return a SnapshotReporter of the latest report', async () => {
      const returnedReporter = await snapshot.apply();

      expect(mockedSnapshotReporter).toHaveBeenCalledTimes(1);
      expect(mockedSnapshotReporter).toHaveBeenCalledWith(mockedApplyRunReport);
      expect(returnedReporter).toBe(mockedSnapshotReporter.mock.instances[0]);
    });
  });

  describe('#delete', () => {
    beforeEach(async () => {
      [snapshot] = await getSnapshot();
    });

    it('should request to delete the snapshot to the platform', async () => {
      await snapshot.delete();

      expect(mockedDeleteSnapshot).toHaveBeenCalledWith(snapshotId);
    });
  });

  describe('#download', () => {
    beforeEach(async () => {
      [snapshot] = await getSnapshot();
    });

    it('should download the snapshot', async () => {
      const fakeResponse = Promise.resolve();
      mockedExportSnapshot.mockReturnValueOnce(fakeResponse);

      const returnBlob = snapshot.download();

      expect(mockedExportSnapshot).toHaveBeenCalledWith(snapshotId, {
        contentFormat: SnapshotExportContentFormat.SplitPerType,
      });
      expect(returnBlob).toBe(fakeResponse);
    });
  });

  describe('#requiresSynchronization', () => {
    let latestReport: ResourceSnapshotsReportModel;
    beforeEach(async () => {
      [snapshot] = await getSnapshot(latestReport);
    });

    describe('when the latestReport resultCode is ResourcesInError', () => {
      beforeAll(() => {
        latestReport = getErrorApplyReport(snapshotId);
      });

      it('should return true', () => {
        expect(snapshot.requiresSynchronization()).toBe(true);
      });
    });

    describe('when the latestReport resultCode is ResourcesInError', () => {
      beforeAll(() => {
        latestReport = getSuccessApplyReport(snapshotId);
      });

      it('should return false', () => {
        expect(snapshot.requiresSynchronization()).toBe(false);
      });
    });
  });

  describe('#saveDetailedReport', () => {
    let someReport: ResourceSnapshotsReportModel;
    beforeEach(async () => {
      someReport = getSuccessApplyReport(snapshotId);
      [snapshot] = await getSnapshot(someReport);
    });

    it('should write the report on disk at the appropriate path and return the latter', () => {
      const somePathStr = 'foo/bar/baz';

      const returnValue = snapshot.saveDetailedReport(somePathStr);

      const expectedFilePath = join(
        somePathStr,
        'snapshot-reports',
        `${someReport.id}.json`
      );

      expect(mockedEnsureFileSync).toBeCalledWith(expectedFilePath);
      expect(mockedWriteJsonSync).toBeCalledWith(expectedFilePath, someReport, {
        spaces: 2,
      });
      expect(returnValue).toBe(expectedFilePath);
    });
  });

  describe('#waitUntilDone', () => {
    let someReport: ResourceSnapshotsReportModel;
    let initialModel: ResourceSnapshotsModel;

    beforeEach(async () => {
      someReport = getSuccessApplyReport(snapshotId);
      [snapshot, initialModel] = await getSnapshot(someReport);
    });

    it('should use default wait, waitInterval and callback by default', () => {
      snapshot.waitUntilDone();

      expect(mockedRetry).toHaveBeenCalledWith(expect.anything(), {
        retries: Math.ceil(
          Snapshot.defaultWaitOptions.wait /
            Snapshot.defaultWaitOptions.waitInterval
        ),
        minTimeout: Snapshot.defaultWaitOptions.waitInterval * 1e3,
        maxTimeout: Snapshot.defaultWaitOptions.waitInterval * 1e3,
        maxRetryTime: Snapshot.defaultWaitOptions.wait * 1e3,
      });
    });

    it('should use provided wait and waitInterval and compute how many attempts to do', () => {
      snapshot.waitUntilDone({wait: 10, waitInterval: 5});

      expect(mockedRetry).toHaveBeenCalledWith(expect.anything(), {
        retries: 2,
        minTimeout: 5 * 1e3,
        maxTimeout: 5 * 1e3,
        maxRetryTime: 10 * 1e3,
      });
    });

    it('should return the retrier from async-retry', () => {
      const expectedReturnPromise = Promise.resolve();
      mockedRetry.mockReturnValue(expectedReturnPromise);

      const returnValue = snapshot.waitUntilDone();

      expect(returnValue).toBe(expectedReturnPromise);
    });

    describe('when a retry happens', () => {
      it('should refresh the snapshotData and call the onRetryCallback', async () => {
        mockedGetSnapshot.mockReturnValue(initialModel);
        const someCallBack = jest.fn();
        snapshot.waitUntilDone({onRetryCb: someCallBack});
        const waitUntilDoneRetryFunction = mockedRetry.mock.calls[0][0];

        await waitUntilDoneRetryFunction(jest.fn(), 0);

        expect(mockedGetSnapshot).toHaveBeenCalledWith(snapshotId, {
          includeReports: true,
        });
        expect(someCallBack).toHaveBeenCalledWith(someReport);
      });

      it('should not resolves when the latestReport status is an ongoing on', async () => {
        const model = {...initialModel};
        model.reports = [
          getPendingReport(snapshotId, ResourceSnapshotsReportType.Apply),
        ];
        mockedGetSnapshot.mockReturnValue(model);
        snapshot.waitUntilDone();
        const waitUntilDoneRetryFunction = mockedRetry.mock.calls[0][0];

        expect(waitUntilDoneRetryFunction(jest.fn(), 0)).rejects.toMatch(
          expect.any(SnapshotOperationTimeoutError)
        );
      });

      describe("when there's no operation to wait for", () => {
        it('should resolves when the latestReport status is not an ongoing on', async () => {
          const model = {...initialModel};
          model.reports = [getSuccessApplyReport(snapshotId)];
          mockedGetSnapshot.mockReturnValue(model);
          snapshot.waitUntilDone();
          const waitUntilDoneRetryFunction = mockedRetry.mock.calls[0][0];

          expect(
            waitUntilDoneRetryFunction(jest.fn(), 0)
          ).resolves.not.toThrow();
        });
      });

      describe("when there's an operation to wait for", () => {
        it('should resolves when the latestReport status is not an ongoing on and the latesReport operations match', async () => {
          const model = {...initialModel};
          model.reports = [getSuccessApplyReport(snapshotId)];
          mockedGetSnapshot.mockReturnValue(model);
          snapshot.waitUntilDone({
            operationToWaitFor: ResourceSnapshotsReportType.Apply,
          });
          const waitUntilDoneRetryFunction = mockedRetry.mock.calls[0][0];

          expect(
            waitUntilDoneRetryFunction(jest.fn(), 0)
          ).resolves.not.toThrow();
        });

        it('should not resolves when the latestReport operation does not match', async () => {
          const model = {...initialModel};
          model.reports = [getSuccessApplyReport(snapshotId)];
          mockedGetSnapshot.mockReturnValue(model);
          snapshot.waitUntilDone({
            operationToWaitFor: ResourceSnapshotsReportType.DryRun,
          });
          const waitUntilDoneRetryFunction = mockedRetry.mock.calls[0][0];

          expect(waitUntilDoneRetryFunction(jest.fn(), 0)).rejects.toMatch(
            expect.any(SnapshotOperationTimeoutError)
          );
        });
      });
    });
  });

  describe('[get]-latestReport', () => {
    describe.each([undefined, []])('when there is no reports', (reports) => {
      beforeEach(async () => {
        [snapshot] = await getSnapshot(reports);
      });

      it('should throw an Error', () => {
        expect(() => snapshot.latestReport).toThrowError(
          `No detailed report found for the snapshot ${snapshotId}`
        );
      });
    });

    describe('when there is at least one report', () => {
      let reports: ResourceSnapshotsReportModel[];
      let mostRecentReport: ResourceSnapshotsReportModel;

      beforeEach(async () => {
        reports = [
          getSuccessApplyReport(snapshotId),
          getSuccessApplyReport(snapshotId),
          getSuccessApplyReport(snapshotId),
        ];
        reports[1].updatedDate++;
        mostRecentReport = reports[1];
        [snapshot] = await getSnapshot(reports);
      });

      it('should return the most recent one', () => {
        expect(snapshot.latestReport).toBe(mostRecentReport);
      });
    });
  });
});
