import {
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportOperationModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
} from '@coveord/platform-client';
import {
  ReportViewerOperationName,
  ReportViewerResourceReportModel,
} from './reportPreviewer/reportPreviewerDataModels';

type ResourceEntries = [string, ResourceSnapshotsReportOperationModel];

export class SnapshotReporter {
  public constructor(public readonly report: ResourceSnapshotsReportModel) {}

  public static convertResourceEntriesToResourceSnapshotsReportOperationModel([
    name,
    operations,
  ]: ResourceEntries) {
    return {name, operations};
  }

  public static resourceHasAtLeastOneOperationFilter(
    operationsToDisplay: ReportViewerOperationName[]
  ) {
    return ([_, operations]: ResourceEntries) =>
      operationsToDisplay.reduce(
        (previous, current) => previous + operations[current],
        0
      ) > 0;
  }

  public hasChangedResources() {
    const totalUnchanges =
      this.getOperationTypeTotalCount('resourcesUnchanged');
    return totalUnchanges !== this.report.resourcesProcessed;
  }

  public getOperationTypeTotalCount(
    type: keyof ResourceSnapshotsReportOperationModel
  ) {
    const count = Object.values(this.report.resourceOperations).reduce(
      (count: number, current: ResourceSnapshotsReportOperationModel) =>
        count + current[type],
      0
    );

    return count;
  }

  public isSuccessReport(): boolean {
    const {status, resultCode} = this.report;
    return (
      status === ResourceSnapshotsReportStatus.Completed &&
      resultCode === ResourceSnapshotsReportResultCode.Success
    );
  }

  public getChangedResources(
    operationsToDisplay: ReportViewerOperationName[]
  ): ReportViewerResourceReportModel[] {
    return Object.entries(this.report.resourceOperations)
      .filter(
        SnapshotReporter.resourceHasAtLeastOneOperationFilter(
          operationsToDisplay
        )
      )
      .map(
        SnapshotReporter.convertResourceEntriesToResourceSnapshotsReportOperationModel
      );
  }
}
