import {cli} from 'cli-ux';
import {red, italic} from 'chalk';
import {ReportViewerSection} from './reportViewerSection';
import {ReportViewerStyles} from './reportViewerStyles';
import {SnapshotReporter} from '../snapshotReporter';
import {
  ReportViewerOperationName,
  ReportViewerResourceReportModel,
} from './reportViewerDataModels';

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
    private reporter: SnapshotReporter,
    operationsToDisplay: ReportViewerOperationName[] = []
  ) {
    this.operationsToDisplay =
      ReportViewer.defaultOperationsToDisplay.concat(operationsToDisplay);
  }

  public display(): void {
    this.printTable();

    if (!this.reporter.isSuccessReport()) {
      this.handleReportErrors();
    }
  }

  private printTable() {
    const changedResources = this.reporter.getChangedResources(
      this.operationsToDisplay
    );

    if (changedResources.length === 0) {
      cli.log(ReportViewerStyles.header('\nNo changes detected'));
      return;
    }

    cli.table(changedResources, {
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

  private prettyPrintResourceName(resourceName: string): string {
    const capitalized =
      resourceName.charAt(0) + resourceName.slice(1).toLowerCase() + 's';
    return capitalized.replace(/_/g, ' ');
  }

  private handleReportErrors() {
    const totalErrorCount =
      this.reporter.getOperationTypeTotalCount('resourcesInError');

    cli.log(ReportViewerStyles.header('Error Report:'));
    cli.log(
      ReportViewerStyles.error(
        `   ${totalErrorCount} resource${
          totalErrorCount > 1 ? 's' : ''
        } in error `
      )
    );

    for (const resourceType in this.reporter.resourceOperationResults) {
      this.logResourceErrors(resourceType);
    }
    // TODO: CDX-362: handle other invalid snashot cases
  }

  private logResourceErrors(resourceType: string) {
    let remainingErrorsToPrint = ReportViewer.maximumNumberOfErrorsToPrint;
    const operationResult =
      this.reporter.resourceOperationResults[resourceType];
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
