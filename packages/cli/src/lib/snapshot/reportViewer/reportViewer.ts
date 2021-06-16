import {
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportOperationModel,
  ResourceSnapshotsReportResultCode,
} from '@coveord/platform-client';
import {cli} from 'cli-ux';
import {red, italic} from 'chalk';
import {ReportViewerSection} from './reportViewerSection';
import {ReportViewerStyles} from './reportViewerStyles';
import {
  ReportViewerOperationName,
  ReportViewerResourceReportModel,
} from './reportViewerInterfaces';

export class ReportViewer {
  public static defaultOperationsToDisplay: ReportViewerOperationName[] = [
    'resourcesCreated',
    'resourcesDeleted',
    'resourcesInError',
    'resourcesRecreated',
    'resourcesUnchanged',
    'resourcesUpdated',
  ];

  public static maximumNumberOfErrorsToPrint = 5;

  private operationsToDisplay: ReportViewerOperationName[];

  public constructor(
    private readonly report: ResourceSnapshotsReportModel,
    operationsToDisplay: ReportViewerOperationName[] = []
  ) {
    this.operationsToDisplay =
      ReportViewer.defaultOperationsToDisplay.concat(operationsToDisplay);
  }

  public display(): void {
    this.printTable();

    if (!this.isSuccessReport()) {
      this.handleReportErrors();
    }
  }

  private printTable() {
    if (this.changedResources.length === 0) {
      cli.log(ReportViewerStyles.header('\nNo changes detected'));
      return;
    }

    cli.table(this.changedResources, {
      resourceName: {
        header: ReportViewerStyles.header('\nPreviewing resource changes:'),
        get: (resource) => this.createSection(resource),
      },
    });
  }

  private createSection(resource: ReportViewerResourceReportModel) {
    const resourceType = this.prettyPrintResourceName(resource.name);
    const indentation = 3;
    const section = new ReportViewerSection(resource, this.operationsToDisplay);
    let output = `${''.padStart(indentation)}${resourceType}\n`;

    output += section.display(indentation + 1);
    return output;
  }

  private get changedResources(): ReportViewerResourceReportModel[] {
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

    const convertArrayToObject = ([name, operations]: resourceEntries) => ({
      name,
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

    cli.log(ReportViewerStyles.header('Error Report:'));
    cli.log(
      ReportViewerStyles.error(
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
