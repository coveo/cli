import {ResourceSnapshotsReportModel} from '@coveo/platform-client';
import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {CliUx} from '@oclif/core';
import {Config} from '@coveo/cli-commons/config/config';
import {
  IsAuthenticated,
  Preconditions,
} from '@coveo/cli-commons/preconditions/index';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {organization, wait} from '../../../lib/flags/snapshotCommonFlags.js';
import {SnapshotReportStatus} from '../../../lib/snapshot/reportPreviewer/reportPreviewerDataModels.js';
import {ReportViewerStyles} from '../../../lib/snapshot/reportPreviewer/reportPreviewerStyles.js';
import {Snapshot, WaitUntilDoneOptions} from '../../../lib/snapshot/snapshot.js';
import {getTargetOrg} from '../../../lib/snapshot/snapshotCommon.js';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory.js';
import {SnapshotReporter} from '../../../lib/snapshot/snapshotReporter.js';
import {startSpinner} from '@coveo/cli-commons/utils/ux';
import {Example} from '@oclif/core/lib/interfaces';

export default class Monitor extends CLICommand {
  public static description = 'Monitor a Snapshot operation';

  public static flags = {
    ...wait(),
    ...organization(
      'The unique identifier of the organization containing the snapshot.'
    ),
  };

  public static args = [
    {
      name: 'snapshotId',
      description: 'The unique identifier of the target snapshot.',
      required: true,
    },
  ];

  public static examples: Example[] = [
    {
      command:
        'coveo org:resources:monitor --organization myorgid --snapshotId mysnapshotid',
      description:
        'Monitor the status of the "mysnapshotid" snapshot in the "myorgid" organization.',
    },
  ];

  @Trackable()
  @Preconditions(IsAuthenticated())
  public async run() {
    await this.printHeader();

    const snapshot = await this.getSnapshot();

    await this.monitorSnapshot(snapshot);
  }

  private async monitorSnapshot(snapshot: Snapshot) {
    const startReporter = new SnapshotReporter(snapshot.latestReport);
    startSpinner(`Operation ${startReporter.type}`, startReporter.status);
    const waitOption = await this.getWaitOption();
    await snapshot.waitUntilDone(waitOption);
    const finalReporter = new SnapshotReporter(snapshot.latestReport);
    await finalReporter
      .setReportHandler(SnapshotReportStatus.ERROR, this.getErrorHandler())
      .handleReport();
  }

  private getErrorHandler() {
    return function (this: SnapshotReporter) {
      CliUx.ux.log(ReportViewerStyles.error(this.resultCode));
    };
  }

  private async printHeader() {
    const {args} = await this.parse(Monitor);
    const snapshotId = args.snapshotId;
    const header = ReportViewerStyles.header(
      `Monitoring snapshot ${snapshotId}`
    );
    CliUx.ux.log('');
    startSpinner(header);
  }

  private refresh(report: ResourceSnapshotsReportModel) {
    const reporter = new SnapshotReporter(report);
    CliUx.ux.action.status = reporter.status;
  }

  private async getSnapshot(): Promise<Snapshot> {
    const {args, flags} = await this.parse(Monitor);
    const snapshotId = args.snapshotId;
    const target = getTargetOrg(this.configuration, flags.organization);

    return SnapshotFactory.createFromExistingSnapshot(snapshotId, target);
  }

  private async getWaitOption(): Promise<WaitUntilDoneOptions> {
    const {flags} = await this.parse(Monitor);
    return {
      wait: flags.wait,
      // TODO: revisit with a progress bar once the response contains the remaining resources to process
      onRetryCb: (report: ResourceSnapshotsReportModel) => this.refresh(report),
    };
  }

  private get configuration() {
    return new Config(this.config.configDir);
  }
}
