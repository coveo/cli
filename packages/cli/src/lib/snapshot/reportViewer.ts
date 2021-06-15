import {
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportOperationModel,
  ResourceSnapshotsReportResultCode,
} from '@coveord/platform-client';
import {cli} from 'cli-ux';
import {bgHex, green, yellow, red, bold, italic} from 'chalk';

export type ReportViewerOperationNames =
  keyof ResourceSnapshotsReportOperationModel;

class ReportViewerOperationLogFactory {
  public constructor(
    private operator: string,
    private style: (text: string) => string,
    private templateString: (count: number) => string
  ) {}

  public getString(count: number, indentation: number) {
    if (count <= 0) {
      return '';
    }
    return `${this.style(this.operator.padEnd(indentation + 1))}${this.style(
      this.templateString(count)
    )}\n`;
  }
}

export class ReportViewer {
  public static defaultOperationsToDisplay: ReportViewerOperationNames[] = [
    'resourcesCreated',
    'resourcesDeleted',
    'resourcesInError',
    'resourcesRecreated',
    'resourcesUpdated',
  ];

  public static maximumNumberOfErrorsToPrint = 5;

  public static styles = {
    green: (txt: string) => green(txt),
    yellow: (txt: string) => yellow(txt),
    red: (txt: string) => red(txt),
    header: (txt: string) => bold.hex('#1CEBCF')(txt),
    error: (txt: string) => bgHex('#F64D64').hex('#272C3A')(txt),
  };

  public static operationToLogFactoryDictionnary: {
    [key in ReportViewerOperationNames]: ReportViewerOperationLogFactory;
  } = {
    resourcesCreated: new ReportViewerOperationLogFactory(
      '+',
      ReportViewer.styles.green,
      (count) => `${count} to create`
    ),
    resourcesRecreated: new ReportViewerOperationLogFactory(
      '+-',
      ReportViewer.styles.yellow,
      (count) => `${count} to replace`
    ),
    resourcesUpdated: new ReportViewerOperationLogFactory(
      '~',
      ReportViewer.styles.yellow,
      (count) => `${count} to update`
    ),
    resourcesDeleted: new ReportViewerOperationLogFactory(
      '-',
      ReportViewer.styles.red,
      (count) => `${count} to delete`
    ),
    resourcesInError: new ReportViewerOperationLogFactory(
      '!',
      ReportViewer.styles.error,
      (count) => `${count} in error`
    ),
    resourcesUnchanged: new ReportViewerOperationLogFactory(
      '⁇',
      ReportViewer.styles.error,
      (count) => `${count} unchanged`
    ),
  };

  public constructor(
    private readonly report: ResourceSnapshotsReportModel,
    private operationsToDisplay: ReportViewerOperationNames[] = [
      ...ReportViewer.defaultOperationsToDisplay,
    ]
  ) {}

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
  private printTableSection(
    row: {
      resourceName: string;
      operations: ResourceSnapshotsReportOperationModel;
    },
    indentation = 3
  ) {
    const resourceType = this.prettyPrintResourceName(row.resourceName);
    let output = `${''.padStart(indentation)}${resourceType}\n`;

    this.operationsToDisplay.forEach(
      (operation) =>
        (output += ReportViewer.operationToLogFactoryDictionnary[
          operation
        ].getString(row.operations[operation], indentation))
    );

    return output;
  }

  private get changedResources() {
    type resourceEntries = [string, ResourceSnapshotsReportOperationModel];
    const resourceHasAtLeastOneOperation = ([
      _,
      operations,
    ]: resourceEntries) => {
      return (
        this.operationsToDisplay.reduce(
          (previous, current) => previous + operations[current],
          0
        ) > 0
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
