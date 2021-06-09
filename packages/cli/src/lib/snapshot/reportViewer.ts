import {
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportOperationModel,
  ResourceSnapshotsReportOperationResults,
  ResourceSnapshotsReportResultCode,
} from '@coveord/platform-client';
import {cli} from 'cli-ux';
import {bgHex, green, yellow, red, bold, italic} from 'chalk';
import {EOL} from 'os';

export class ReportViewer {
  private style = {
    green: (txt: string) => green(txt),
    yellow: (txt: string) => yellow(txt),
    red: (txt: string) => red(txt),
    header: (txt: string) => bold.hex('#1CEBCF')(txt),
    error: (txt: string) => bgHex('#F64D64').hex('#272C3A')(txt),
  };

  public constructor(private readonly report: ResourceSnapshotsReportModel) {}

  public view(): void {
    this.printTable();

    if (!this.isSuccessReport()) {
      this.handleReportErrors();
    }
  }

  private printTable() {
    if (this.changedResources.length === 0) {
      cli.log(this.style.header(`${EOL}No changes to apply`));
      return;
    }

    cli.table(this.changedResources, {
      resourceName: {
        header: this.style.header(`${EOL}Previewing resource changes:`),
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
    let output = `   ${resourceType}${EOL}`;

    if (row.operations.resourcesCreated > 0) {
      output += `${this.style.green('+')}  ${this.style.green(
        `${row.operations.resourcesCreated} to create`
      )}${EOL}`;
    }
    if (row.operations.resourcesRecreated > 0) {
      output += `${this.style.yellow('+-')} ${this.style.yellow(
        `${row.operations.resourcesCreated} to replace`
      )}${EOL}`;
    }
    if (row.operations.resourcesUpdated > 0) {
      output += `${this.style.yellow('~')}  ${this.style.yellow(
        `${row.operations.resourcesUpdated} to update`
      )}${EOL}`;
    }
    // TODO: CDX-361: Only show delete items if delete flag is set to true
    if (row.operations.resourcesDeleted > 0) {
      output += `${this.style.red('-')}  ${this.style.red(
        `${row.operations.resourcesDeleted} to delete`
      )}${EOL}`;
    }
    if (row.operations.resourcesInError > 0) {
      output += `${this.style.error(
        `!  ${row.operations.resourcesInError} in error `
      )}${EOL}`;
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

    cli.log(this.style.header('Error Report:'));
    cli.log(
      this.style.error(
        `   ${totalErrorCount} resource${
          totalErrorCount > 1 ? 's' : ''
        } in error `
      )
    );

    for (const resourceType in this.report.resourceOperationResults) {
      let remainingErrorsToPrint = 5;
      const operationResult =
        this.report.resourceOperationResults[resourceType];
      const hasNoError = (op: ResourceSnapshotsReportOperationResults) =>
        Object.keys(op).length === 0;

      if (hasNoError(operationResult)) {
        continue;
      }

      cli.log(`${EOL}${bold(this.prettyPrintResourceName(resourceType))}`);

      for (const resourceInError in operationResult) {
        const errorList = operationResult[resourceInError];
        for (let i = 0; i < errorList.length; i++) {
          if (remainingErrorsToPrint > 0) {
            cli.log(red(`• ${errorList[i]}`));
          } else {
            break;
          }
          remainingErrorsToPrint--;
        }
        if (remainingErrorsToPrint === 0) {
          const unprintedErrors =
            Object.keys(operationResult).length - remainingErrorsToPrint;
          cli.log(
            italic(
              `(${unprintedErrors} more error${unprintedErrors > 1 ? 's' : ''})`
            )
          );
          break;
        }
      }
    }
    // TODO: CDX-362: handle other invalid snashot cases
  }
}
