import {ReportViewerStyles} from './reportPreviewerStyles';
import {
  ReportViewerOperationName,
  ReportViewerResourceReportModel,
} from './reportPreviewerDataModels';
import {ResourceSnapshotsReportOperationModel} from '@coveo/platform-client';

class ReportViewerOperationLogFactory {
  public constructor(
    private operator: string,
    private color: keyof typeof ReportViewerStyles,
    private templateString: (count: number) => string
  ) {}

  public getString(count: number, indentation: number) {
    return `${ReportViewerStyles[this.color](
      this.operator.padEnd(indentation)
    )}${ReportViewerStyles[this.color](this.templateString(count))}\n`;
  }
}

export class ReportViewerSection {
  public constructor(
    private resource: ReportViewerResourceReportModel,
    private operationsToDisplay: ReportViewerOperationName[]
  ) {}

  public static operationToLogFactoryDictionnary: {
    [key in ReportViewerOperationName]: ReportViewerOperationLogFactory;
  } = {
    resourcesCreated: new ReportViewerOperationLogFactory(
      '+',
      'green',
      (count) => `${count} to create`
    ),
    resourcesRecreated: new ReportViewerOperationLogFactory(
      '+-',
      'yellow',
      (count) => `${count} to replace`
    ),
    resourcesUpdated: new ReportViewerOperationLogFactory(
      '~',
      'yellow',
      (count) => `${count} to update`
    ),
    resourcesDeleted: new ReportViewerOperationLogFactory(
      '-',
      'red',
      (count) => `${count} to delete`
    ),
    resourcesInError: new ReportViewerOperationLogFactory(
      '!',
      'error',
      (count) => `${count} in error`
    ),
    resourcesUnchanged: new ReportViewerOperationLogFactory(
      ' ',
      'gray',
      (count) => `${count} unchanged`
    ),
  };

  private shouldPrintOperation(
    operation: keyof ResourceSnapshotsReportOperationModel
  ): boolean {
    const canBeDisplayed = this.operationsToDisplay.includes(operation);
    const isResourceAffectedByOperation =
      this.resource.operations[operation] > 0;

    return canBeDisplayed && isResourceAffectedByOperation;
  }

  public display(indentation: number) {
    return this.operationsToDisplay.reduce((previous, current) => {
      if (!this.shouldPrintOperation(current)) {
        return previous;
      }
      const operationToLog =
        ReportViewerSection.operationToLogFactoryDictionnary[current].getString(
          this.resource.operations[current],
          indentation
        );
      return previous + operationToLog;
    }, '');
  }
}
