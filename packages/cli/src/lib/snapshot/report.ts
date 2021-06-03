import {
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
} from '@coveord/platform-client';
import {cli} from 'cli-ux';

/**
 * TODO: Remove this 2 interfaces
 * This section of the detailed report has no type available in the platform client.
 * The API may be subject to change due to SRC-4448
 *
 * In the meantime, we define the missing interfaces to prevent having any and unknown types.
 */
export interface ResourceSnapshotsReportOperationModel {
  resourcesCreated: number;
  resourcesUpdated: number;
  resourcesRecreated: number;
  resourcesDeleted: number;
  resourcesInError: number;
  resourcesUnchanged: number;
}
export interface ResourceSnapshotsReportOperations {
  [resourceType: string]: ResourceSnapshotsReportOperationModel;
}

export class Report {
  public constructor(private report: ResourceSnapshotsReportModel) {}

  public preview(): void {
    this.printTitle();

    if (!this.isSuccessReport()) {
      this.handleReportErrors();
    }
    // this.printTable();
  }

  private printTitle() {
    cli.log('Content summary');
  }

  private printTable() {
    throw new Error('');
  }

  private getAffectedResources() {}

  private prettyPrintResourceName(resourceName: string): string {
    throw new Error('TODO');
  }

  private get numberOfResourcesProcessed(): number {
    throw new Error('TODO');
  }

  private isSuccessReport(): boolean {
    return this.report.resultCode === ResourceSnapshotsReportResultCode.Success;
  }

  private get totalNumberOfErrors() {
    const operations = this.report
      .resourceOperations as ResourceSnapshotsReportOperations;

    const errorCount = Object.values(operations).reduce(
      (count: number, current: ResourceSnapshotsReportOperationModel) =>
        count + current.resourcesInError,
      0
    );

    return errorCount;
  }

  private handleReportErrors() {
    cli.warn(`${this.totalNumberOfErrors} resources in error`);
    // TODO: CDX-362: handle other invalid snashot cases
    // cli.log(`${this.totalNumberOfErrors}`);
  }
}
