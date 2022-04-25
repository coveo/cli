import {CliUx} from '@oclif/core';
import {red, italic, green} from 'chalk';
import {ReportViewerSection} from './reportPreviewerSection';
import {ReportViewerStyles} from './reportPreviewerStyles';
import {SnapshotReporter} from '../snapshotReporter';
import {
  ReportViewerOperationName,
  ReportViewerResourceReportModel,
  SnapshotReportStatus,
} from './reportPreviewerDataModels';
import dedent from 'ts-dedent';
import {recordable} from '../../utils/record';

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
    private readonly reporter: SnapshotReporter,
    operationsToDisplay: ReportViewerOperationName[] = []
  ) {
    this.operationsToDisplay =
      ReportViewer.defaultOperationsToDisplay.concat(operationsToDisplay);
  }

  public async display(): Promise<void> {
    this.printTable();
    await this.reporter
      .setReportHandler(
        SnapshotReportStatus.ERROR,
        this.getReportErrorsHandler()
      )
      .setReportHandler(
        SnapshotReportStatus.NO_CHANGES,
        this.getNoChangesReportHandler()
      )
      .handleReport();
  }

  private getNoChangesReportHandler(): (
    this: SnapshotReporter
  ) => void | Promise<void> {
    return function (this: SnapshotReporter) {
      CliUx.ux.log(dedent`${green('No resources to change')}.

      The target organization already matches the configuration.`);
      return;
    };
  }

  private getReportErrorsHandler(): (
    this: SnapshotReporter
  ) => void | Promise<void> {
    const reportHandler = this.handleReportErrors.bind(this);
    return function (this: SnapshotReporter) {
      reportHandler();
    };
  }

  private printTable() {
    const changedResources = this.reporter.getChangedResources(
      this.operationsToDisplay
    );

    if (changedResources.length === 0) {
      CliUx.ux.log(ReportViewerStyles.header('\nNo changes detected'));
      return;
    }

    CliUx.ux.table(recordable(changedResources), {
      resourceName: {
        header: ReportViewerStyles.header('\nPreviewing resource changes:'),
        get: (resource) => this.createSection(resource),
      },
    });
  }

  private createSection(resource: ReportViewerResourceReportModel) {
    const ResourceSnapshotType = this.prettyPrintResourceName(resource.name);
    const indentation = 3;
    const section = new ReportViewerSection(resource, this.operationsToDisplay);
    let output = `${''.padStart(indentation)}${ResourceSnapshotType}\n`;

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

    CliUx.ux.log(ReportViewerStyles.header('Error Report:'));
    CliUx.ux.log(
      ReportViewerStyles.error(
        `   ${totalErrorCount} resource${
          totalErrorCount > 1 ? 's' : ''
        } in error `
      )
    );

    const operationResults = this.reporter.report.resourceOperationResults;
    for (const resourceType in operationResults) {
      this.logResourceErrors(resourceType);
    }
    this.printNewLine();
  }

  private logResourceErrors(ResourceSnapshotType: string) {
    let remainingErrorsToPrint = ReportViewer.maximumNumberOfErrorsToPrint;

    const operationResults = this.reporter.report.resourceOperationResults;
    const operationResult = operationResults[ResourceSnapshotType];
    const operationResultErrors = Object.values(operationResult);

    if (operationResultErrors.length === 0) {
      return;
    }

    CliUx.ux.log(`\n ${this.prettyPrintResourceName(ResourceSnapshotType)}`);

    const errors = operationResultErrors.reduce(
      (acc, curr) => acc.concat(curr),
      []
    );

    for (let j = 0; j < errors.length && remainingErrorsToPrint > 0; j++) {
      CliUx.ux.log(red(`  • ${errors[j]}`));
      remainingErrorsToPrint--;
    }

    const unprintedErrors =
      errors.length - ReportViewer.maximumNumberOfErrorsToPrint;
    if (unprintedErrors > 0) {
      CliUx.ux.log(
        italic(
          `  (${unprintedErrors} more error${unprintedErrors > 1 ? 's' : ''})`
        )
      );
    }
  }

  private printNewLine() {
    CliUx.ux.log('');
  }
}
