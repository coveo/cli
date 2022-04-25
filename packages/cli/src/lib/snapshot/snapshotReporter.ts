import {
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportOperationModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
} from '@coveord/platform-client';
import {
  ReportViewerOperationName,
  ReportViewerResourceReportModel,
  SnapshotReportStatus,
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

  private reportHandlers: Record<
    SnapshotReportStatus,
    (this: SnapshotReporter) => void | Promise<void>
  > = {
    [SnapshotReportStatus.SUCCESS]: () => {},
    [SnapshotReportStatus.NO_CHANGES]: () => {},
    [SnapshotReportStatus.MISSING_VAULT_ENTRIES]: () => {},
    [SnapshotReportStatus.ERROR]: () => {},
  };

  public setReportHandler(
    status: SnapshotReportStatus,
    handler: (this: SnapshotReporter) => void | Promise<void>
  ): SnapshotReporter {
    this.reportHandlers[status] = handler;
    return this;
  }

  public async handleReport(): Promise<void> {
    await this.reportHandlers[this.getReportStatus()].apply(this);
  }

  public getReportStatus(): SnapshotReportStatus {
    if (this.isSuccessReport()) {
      return this.hasChangedResources()
        ? SnapshotReportStatus.SUCCESS
        : SnapshotReportStatus.NO_CHANGES;
    }
    if (this.isVaultEntriesMissingReport()) {
      return SnapshotReportStatus.MISSING_VAULT_ENTRIES;
    }
    return SnapshotReportStatus.ERROR;
  }

  private isVaultEntriesMissingReport(): boolean {
    for (const resourceTypeEntry of Object.values(
      this.report.resourceOperationResults
    )) {
      for (const errors of Object.values(resourceTypeEntry)) {
        for (const err of errors) {
          if (!SnapshotReporter.isVaultEntryMessage(err)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  private static isVaultEntryMessage(err: string): boolean {
    // TODO CDX-939: Define contract with backend for report and upcoming contract.
    // Current 'contract' 😅:
    return /^The vault entry referenced by.*could not be found in the vault\.$/.test(
      err
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

  public get type() {
    const type = this.prettify(this.report.type);
    return type;
  }

  public get status() {
    const status = this.prettify(this.report.status);
    return status;
  }

  public get resultCode() {
    const status = this.prettify(this.report.resultCode);
    return status;
  }

  private prettify(str: string): string {
    const capitalized = (word: string) =>
      word.charAt(0) + word.slice(1).toLowerCase();

    const spaced = str.replace(/_/g, ' ');
    return spaced.split(' ').map(capitalized).join(' ');
  }
}
