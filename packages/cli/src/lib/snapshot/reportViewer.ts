import {
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportOperationModel,
  ResourceSnapshotsReportResultCode,
} from '@coveord/platform-client';
import {cli} from 'cli-ux';
import {bgHex, green, yellow, red, bold, italic} from 'chalk';

export class ReportViewer {
  public static maximumNumberOfErrorsToPrint = 5;
  public static styles = {
    green: (txt: string) => green(txt),
    yellow: (txt: string) => yellow(txt),
    red: (txt: string) => red(txt),
    header: (txt: string) => bold.hex('#1CEBCF')(txt),
    error: (txt: string) => bgHex('#F64D64').hex('#272C3A')(txt),
  };

  public constructor(private readonly report: ResourceSnapshotsReportModel) {}

  public display(): void {
    this.printTable();

    if (!this.isSuccessReport()) {
      this.handleReportErrors();
    }
  }

  private printTable() {
    if (this.changedResources.length === 0) {
      cli.log(ReportViewer.styles.header('\nNo changes detected'));
      return;
    }

    cli.table(this.changedResources, {
      resourceName: {
        header: ReportViewer.styles.header('\nPreviewing resource changes:'),
        get: (row) => this.printTableSection(row),
      },
    });
  }

  // TODO: Change logic once SRC-4448 is complete
  private printTableSection(row: {
    resourceName: string;
    operations: ResourceSnapshotsReportOperationModel;
  }) {
    const resourceType = this.prettyPrintResourceName(row.resourceName);
    let output = `   ${resourceType}\n`;

    if (row.operations.resourcesCreated > 0) {
      output += `${ReportViewer.styles.green(
        '+'
      )}   ${ReportViewer.styles.green(
        `${row.operations.resourcesCreated} to create`
      )}\n`;
    }
    if (row.operations.resourcesRecreated > 0) {
      output += `${ReportViewer.styles.yellow(
        '+-'
      )}  ${ReportViewer.styles.yellow(
        `${row.operations.resourcesCreated} to replace`
      )}\n`;
    }
    if (row.operations.resourcesUpdated > 0) {
      output += `${ReportViewer.styles.yellow(
        '~'
      )}   ${ReportViewer.styles.yellow(
        `${row.operations.resourcesUpdated} to update`
      )}\n`;
    }
    // TODO: CDX-361: Only show delete items if delete flag is set to true
    if (row.operations.resourcesDeleted > 0) {
      output += `${ReportViewer.styles.red('-')}   ${ReportViewer.styles.red(
        `${row.operations.resourcesDeleted} to delete`
      )}\n`;
    }
    if (row.operations.resourcesInError > 0) {
      output += `${ReportViewer.styles.error(
        `!   ${row.operations.resourcesInError} in error `
      )}\n`;
    }

    return output;
  }

  private get changedResources() {
    type resourceEntries = [string, ResourceSnapshotsReportOperationModel];
    const resourceHasAtLeastOneOperation = ([
      _,
      operations,
    ]: resourceEntries) => {
      return (
        operations.resourcesCreated +
          operations.resourcesUpdated +
          operations.resourcesRecreated +
          // TODO: CDX-361: Only count delete items if delete flag is set to true
          operations.resourcesDeleted +
          operations.resourcesInError >
        0
      );
    };

    const convertArrayToObject = ([
      resourceName,
      operations,
    ]: resourceEntries) => ({
      resourceName,
      operations,
    });

    return Object.entries(this.report.resourceOperations)
      .filter(resourceHasAtLeastOneOperation)
      .map(convertArrayToObject);
  }

  private prettyPrintResourceName(resourceName: string): string {
    const capitalized =
      resourceName.charAt(0) + resourceName.slice(1).toLowerCase() + 's';
    return capitalized.replace(/_/g, ' ');
  }

  private isSuccessReport(): boolean {
    return this.report.resultCode === ResourceSnapshotsReportResultCode.Success;
  }

  private getOperationTypeTotalCount(
    type: keyof ResourceSnapshotsReportOperationModel
  ) {
    const count = Object.values(this.report.resourceOperations).reduce(
      (count: number, current: ResourceSnapshotsReportOperationModel) =>
        count + current[type],
      0
    );

    return count;
  }

  private handleReportErrors() {
    const totalErrorCount = this.getOperationTypeTotalCount('resourcesInError');

    cli.log(ReportViewer.styles.header('Error Report:'));
    cli.log(
      ReportViewer.styles.error(
        `   ${totalErrorCount} resource${
          totalErrorCount > 1 ? 's' : ''
        } in error `
      )
    );

    for (const resourceType in this.report.resourceOperationResults) {
      this.logResourceErrors(resourceType);
    }
    // TODO: CDX-362: handle other invalid snashot cases
  }

  private logResourceErrors(resourceType: string) {
    let remainingErrorsToPrint = ReportViewer.maximumNumberOfErrorsToPrint;
    const operationResult = this.report.resourceOperationResults[resourceType];
    const operationResultErrors = Object.values(operationResult);

    if (operationResultErrors.length === 0) {
      return;
    }

    cli.log(`\n ${this.prettyPrintResourceName(resourceType)}`);

    const errors = operationResultErrors.reduce(
      (acc, curr) => acc.concat(curr),
      []
    );

    for (let j = 0; j < errors.length && remainingErrorsToPrint > 0; j++) {
      cli.log(red(`  • ${errors[j]}`));
      remainingErrorsToPrint--;
    }

    const unprintedErrors =
      errors.length - ReportViewer.maximumNumberOfErrorsToPrint;
    if (unprintedErrors > 0) {
      cli.log(
        italic(
          `  (${unprintedErrors} more error${unprintedErrors > 1 ? 's' : ''})`
        )
      );
    }
  }
}
