import type {SnapshotReport} from '../../../lib/snapshot/snapshot';
import {Command, CliUx} from '@oclif/core';
import {Config} from '../../../lib/config/config';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {Trackable} from '../../../lib/decorators/preconditions/trackable';
import {organization, wait} from '../../../lib/flags/snapshotCommonFlags';
import {SnapshotReportStatus} from '../../../lib/snapshot/reportPreviewer/reportPreviewerDataModels';
import {ReportViewerStyles} from '../../../lib/snapshot/reportPreviewer/reportPreviewerStyles';
import {Snapshot, WaitUntilDoneOptions} from '../../../lib/snapshot/snapshot';
import {
  getTargetOrg,
  handleSnapshotError,
} from '../../../lib/snapshot/snapshotCommon';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';
import {SnapshotReporter} from '../../../lib/snapshot/snapshotReporter';

export default class Monitor extends Command {
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

  @Trackable()
  @Preconditions(IsAuthenticated())
  public async run() {
    await this.printHeader();

    const snapshot = await this.getSnapshot();

    await this.monitorSnapshot(snapshot);
  }

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    handleSnapshotError(err);
  }

  private async monitorSnapshot(snapshot: Snapshot) {
    const startReporter = new SnapshotReporter(snapshot.latestReport);
    CliUx.ux.action.start(
      `Operation ${startReporter.type}`,
      startReporter.status
    );
    const waitOption = await this.getWaitOption();
    await snapshot.waitUntilDone(waitOption);
    const finalReporter = new SnapshotReporter(snapshot.latestReport);
    await finalReporter
      .setReportHandler(SnapshotReportStatus.ERROR, this.getErrorHandler())
      .handleReport();
  }

  private getErrorHandler() {
    return async function (this: SnapshotReporter) {
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
    CliUx.ux.action.start(header);
  }

  // TODO: CDX-949: remove and replace with progress bar
  private refresh(report: SnapshotReport) {
    CliUx.ux.action.status = SnapshotReporter.prettify(report.status);
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
      // TODO: CDX-949: revisit with a progress bar once the response contains the remaining resources to process
      onRetryCb: (report: SnapshotReport) => this.refresh(report),
    };
  }

  private get configuration() {
    return new Config(this.config.configDir);
  }
}
