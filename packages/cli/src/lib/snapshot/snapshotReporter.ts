import {
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportOperationModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  ResourceSnapshotType,
} from '@coveord/platform-client';
import {
  ReportViewerOperationName,
  ReportViewerResourceReportModel,
  SnapshotReportStatus,
} from './reportPreviewer/reportPreviewerDataModels';

type ResourceEntries = [string, ResourceSnapshotsReportOperationModel];

type NoopHandler = (this: void) => void;
type SnapshotReporterHandler = (this: SnapshotReporter) => void | Promise<void>;

type SnapshotReporterHandlers = {
  [K in SnapshotReportStatus]: SnapshotReporterHandler | NoopHandler;
};

export type VaultEntryAttributes = {
  vaultEntryId: string;
  resourceName: string;
  resourceType: ResourceSnapshotType;
};

export class SnapshotReporter {
  private missingVaultEntriesSet: Set<VaultEntryAttributes> = new Set();

  public get missingVaultEntries() {
    return this.missingVaultEntriesSet.values();
  }
  public resourceInErrorCount: number = 0;
  public resourceInError: Map<Partial<ResourceSnapshotType>, Set<string>> =
    new Map();
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

  private reportHandlers: SnapshotReporterHandlers = {
    [SnapshotReportStatus.SUCCESS]: () => {},
    [SnapshotReportStatus.NO_CHANGES]: () => {},
    [SnapshotReportStatus.MISSING_VAULT_ENTRIES]: () => {},
    [SnapshotReportStatus.ERROR]: () => {},
  };

  public setReportHandler<T extends SnapshotReportStatus>(
    status: T,
    handler: SnapshotReporterHandlers[T]
  ): SnapshotReporter {
    this.reportHandlers[status] = handler;
    return this;
  }

  public async handleReport(): Promise<void> {
    const reportStatuses = this.getReportStatuses();
    await this.executeHandlers(reportStatuses.fixables);
    if (reportStatuses.errors.length > 0) {
      await this.executeHandlers(reportStatuses.errors);
      return;
    }
    if (reportStatuses.successes.length > 0) {
      await this.executeHandlers(reportStatuses.successes);
    }
  }

  private async executeHandlers(reportStatuses: SnapshotReportStatus[]) {
    for (const status of reportStatuses) {
      await this.callAndReset(status);
    }
  }

  private async callAndReset(handler: SnapshotReportStatus) {
    await this.reportHandlers[handler].apply(this);
    this.reportHandlers[handler] = () => {};
  }

  private getReportStatuses() {
    const statuses: Record<
      'fixables' | 'successes' | 'errors',
      SnapshotReportStatus[]
    > = {
      fixables: [],
      successes: [],
      errors: [],
    };

    this.parseResourcesOperationsResults();
    if (this.missingVaultEntriesSet.size > 0) {
      statuses.fixables.push(SnapshotReportStatus.MISSING_VAULT_ENTRIES);
    }

    if (!this.hasChangedResources()) {
      statuses.successes.push(SnapshotReportStatus.NO_CHANGES);
    }

    if (this.isSuccessReport()) {
      statuses.successes.push(SnapshotReportStatus.SUCCESS);
    }

    if (this.resourceInErrorCount > 0) {
      statuses.errors.push(SnapshotReportStatus.ERROR);
    }

    return statuses;
  }

  private parseResourcesOperationsResults(): void {
    for (const [resourceType, resource] of Object.entries(
      this.report.resourceOperationResults
    )) {
      for (const [resourceName, errors] of Object.entries(resource)) {
        for (const err of errors) {
          this.parseResourceOperationResult(err, resourceName, resourceType);
        }
      }
    }
  }

  private parseResourceOperationResult(
    err: string,
    resourceName: string,
    resourceType: string
  ) {
    const missingEntry = SnapshotReporter.tryGetMissingVaultEntryName(err);
    if (missingEntry) {
      this.missingVaultEntriesSet.add({
        vaultEntryId: missingEntry,
        resourceName: resourceName,
        resourceType: resourceType as ResourceSnapshotType,
      });
    } else {
      // TODO: Fix PlatformClient to reflect proper typing.
      this.addResourceInError(resourceType as ResourceSnapshotType, err);
    }
  }

  private addResourceInError(resourceType: ResourceSnapshotType, err: string) {
    this.resourceInErrorCount++;
    let errorSet = this.resourceInError.get(resourceType);
    if (!errorSet) {
      errorSet = new Set();
      this.resourceInError.set(resourceType, errorSet);
    }
    errorSet.add(err);
  }

  private static missingVaultMatcher =
    /^The vault entry referenced by \{\{ (?<entryName>.*) \}\} could not be found in the vault\.$/;

  private static tryGetMissingVaultEntryName(err: string): string | undefined {
    // TODO: CDX-939: Define contract with backend for report and upcoming contract.
    // Current 'contract' 😅:
    const match = err.match(SnapshotReporter.missingVaultMatcher);
    return match?.groups?.['entryName'];
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
