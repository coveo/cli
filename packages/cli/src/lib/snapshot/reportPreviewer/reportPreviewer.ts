import {CliUx} from '@oclif/core';
import {red, italic, green, yellow, ChalkFunction} from 'chalk';
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

type Plurable = [singular: string, plural: string];
function pluralizeIfNeeded(plurable: Plurable, unprintedMessages: number) {
  return plurable[unprintedMessages > 1 ? 1 : 0];
}

export class ReportViewer {
  private static errorPlurable: Plurable = ['error', 'errors'];
  private static entryPlurable: Plurable = ['entry', 'entries'];

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
      .setReportHandler(
        SnapshotReportStatus.MISSING_VAULT_ENTRIES,
        this.getMissingEntriesHandler()
      )
      .handleReport();
  }

  private getMissingEntriesHandler(): (
    this: SnapshotReporter
  ) => void | Promise<void> {
    const missingVaultEntryPrinter = (entries: string[]) =>
      ReportViewer.printAbridgedMessages(
        entries,
        ReportViewer.entryPlurable,
        yellow
      );
    return function (this: SnapshotReporter) {
      const entries = Array.from(this.missingVaultEntries);
      CliUx.ux.log(
        yellow(
          `Missing vault ${pluralizeIfNeeded(
            ReportViewer.entryPlurable,
            entries.length
          )}:`
        )
      );
      missingVaultEntryPrinter(entries);
    };
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

    ReportViewer.printAbridgedMessages(errors, ReportViewer.errorPlurable, red);
  }

  private static printAbridgedMessages(
    messages: string[],
    plurable: Plurable,
    chalker: ChalkFunction
  ) {
    let remainingErrorsToPrint = ReportViewer.maximumNumberOfErrorsToPrint;
    for (let j = 0; j < messages.length && remainingErrorsToPrint > 0; j++) {
      CliUx.ux.log(chalker(`  • ${messages[j]}`));
      remainingErrorsToPrint--;
    }

    const unprintedMessages =
      messages.length - ReportViewer.maximumNumberOfErrorsToPrint;
    if (unprintedMessages > 0) {
      CliUx.ux.log(
        italic(
          `  (${unprintedMessages} more ${pluralizeIfNeeded(
            plurable,
            unprintedMessages
          )})`
        )
      );
    }
  }

  private printNewLine() {
    CliUx.ux.log('');
  }
}
