import {ResourceSnapshotsReportModel} from '@coveord/platform-client';
import {Command, Flags} from '@oclif/core';
import {cli} from 'cli-ux';
import {Config} from '../../../lib/config/config';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {Trackable} from '../../../lib/decorators/preconditions/trackable';
import {wait} from '../../../lib/flags/snapshotCommonFlags';
import {ReportViewerStyles} from '../../../lib/snapshot/reportPreviewer/reportPreviewerStyles';
import {Snapshot, WaitUntilDoneOptions} from '../../../lib/snapshot/snapshot';
import {
  getTargetOrg,
  // handleSnapshotError,
  handleReportWithErrors,
} from '../../../lib/snapshot/snapshotCommon';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';
import {SnapshotReporter} from '../../../lib/snapshot/snapshotReporter';

export default class Monitor extends Command {
  public static description = 'Monitor a Snapshot operation';

  public static flags = {
    ...wait(),
    target: Flags.string({
      char: 't',
      description:
        'The unique identifier of the organization containing the snapshot. If not specified, the organization you are connected to will be used.',
      helpValue: 'destinationorganizationg7dg3gd',
      required: false,
    }),
  };

  public static args = [
    {
      name: 'snapshotId',
      description: 'The unique identifier of the target snapshot.',
      required: true,
    },
  ];

  public static hidden = true;

  @Trackable()
  @Preconditions(IsAuthenticated())
  public async run() {
    this.printHeader();

    const snapshot = await this.getSnapshot();

    await this.monitorSnapshot(snapshot);
  }

  @Trackable()
  public async catch(err?: Record<string, unknown>) {
    throw err;
  }

  private async monitorSnapshot(snapshot: Snapshot) {
    const reporter = new SnapshotReporter(snapshot.latestReport);
    cli.action.start(`Operation ${reporter.type}`, reporter.status);
    await snapshot.waitUntilDone(await this.getWaitOption());
    await this.displayMonitorResult(snapshot, reporter);
  }

  private async displayMonitorResult(
    snapshot: Snapshot,
    reporter: SnapshotReporter
  ) {
    if (!reporter.isSuccessReport()) {
      const cfg = await this.configuration.get();
      cli.log(ReportViewerStyles.error(reporter.resultCode));
      await handleReportWithErrors(snapshot, cfg);
    }
  }

  private async printHeader() {
    const {args} = await this.parse(Monitor);
    const snapshotId = args.snapshotId;
    const header = ReportViewerStyles.header(
      `Monitoring snapshot ${snapshotId}`
    );
    cli.log('');
    cli.action.start(header);
  }

  private refresh(report: ResourceSnapshotsReportModel) {
    const reporter = new SnapshotReporter(report);
    cli.action.status = reporter.status;
  }

  private async getSnapshot(): Promise<Snapshot> {
    const {args, flags} = await this.parse(Monitor);
    const snapshotId = args.snapshotId;
    const target = await getTargetOrg(this.configuration, flags.target);

    return SnapshotFactory.createFromExistingSnapshot(snapshotId, target);
  }

  private async getWaitOption(): Promise<WaitUntilDoneOptions> {
    const flags = (await this.parse(Monitor)).flags;
    return {
      wait: flags.wait,
      // TODO: revisit with a progress bar once the response contains the remaining resources to process
      onRetryCb: (report: ResourceSnapshotsReportModel) => this.refresh(report),
    };
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }
}
