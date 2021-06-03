import {
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
} from '@coveord/platform-client';
import {cli} from 'cli-ux';
import {bgHex} from 'chalk';

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

// TODO: rename class
export class Report {
  private colors = {
    warn: '#DC8D44',
    error: '#F64D64',
  };

  public constructor(private report: ResourceSnapshotsReportModel) {}

  public preview(): void {
    cli.log('Previewing changes');
    cli.log('');

    this.printTable();

    cli.log('');
    cli.log('Info');
    if (!this.isSuccessReport()) {
      this.handleReportErrors();
    }
    this.printSummary();
  }

  private printSummary() {
    const created = this.getOperationTypeCount('resourcesCreated');
    const updated = this.getOperationTypeCount('resourcesUpdated');
    const deleted = this.getOperationTypeCount('resourcesDeleted');
    if (created) {
      cli.log(`${created} resources to create`);
    }
    if (updated) {
      cli.log(`${updated} resources to update`);
    }
    if (deleted) {
      cli.log(`${deleted} resources to delete`);
    }
  }

  private printTable() {
    const resources = this.getAffectedResources();
    cli.table(resources, {
      resourceName: {
        header: 'Resource',
        get: (row) => `x ${row.resourceName}`,
      },
      operations: {header: 'Operations'},
    });
  }

  // TODO: rename and use getter
  private getAffectedResources() {
    const resourceOperations: ResourceSnapshotsReportOperations = JSON.parse(
      JSON.stringify(this.report.resourceOperations)
    );

    const resourceHasAtLeastOneOperation = ([_, operations]: [
      string,
      ResourceSnapshotsReportOperationModel
    ]) => {
      const sumReducer = (a: number, b: number) => a + b;
      const allResourceOperations = Object.values(operations);
      const numberOfAffectedResources = allResourceOperations.reduce(
        sumReducer,
        0
      );
      return numberOfAffectedResources > 0;
    };

    const convertArrayToObject = ([resourceName, operations]: [
      string,
      ResourceSnapshotsReportOperationModel
    ]) => ({
      resourceName,
      operations,
    });

    return Object.entries(resourceOperations)
      .filter(resourceHasAtLeastOneOperation)
      .map(convertArrayToObject);
  }

  private prettyPrintResourceName(resourceName: string): string {
    throw new Error('TODO');
  }

  private get numberOfResourcesProcessed(): number {
    throw new Error('TODO');
  }

  private isSuccessReport(): boolean {
    return this.report.resultCode === ResourceSnapshotsReportResultCode.Success;
  }

  private getOperationTypeCount(
    type: keyof ResourceSnapshotsReportOperationModel
  ) {
    const operations = this.report
      .resourceOperations as ResourceSnapshotsReportOperations;

    const errorCount = Object.values(operations).reduce(
      (count: number, current: ResourceSnapshotsReportOperationModel) =>
        count + current[type],
      0
    );

    return errorCount;
  }

  private error(message: string) {
    cli.log(bgHex(this.colors.error).hex('#272C3A')(message));
  }

  private handleReportErrors() {
    const errorCount = this.getOperationTypeCount('resourcesInError');
    this.error(`${errorCount} resources in error`.toUpperCase());
    // TODO: CDX-362: handle other invalid snashot cases
    // cli.log(`${this.totalNumberOfErrors}`);
  }
}
