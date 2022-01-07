import {ResourceSnapshotsReportModel} from '@coveord/platform-client';
import {flags, Command} from '@oclif/command';
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
  handleSnapshotError,
  handleReportWithErrors,
} from '../../../lib/snapshot/snapshotCommon';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';
import {SnapshotReporter} from '../../../lib/snapshot/snapshotReporter';

export default class Monitor extends Command {
  public static description = '(beta) Monitor a Snapshot operation';

  public static flags = {
    ...wait(),
    target: flags.string({
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

  @Trackable()
  @Preconditions(IsAuthenticated())
  public async run() {
    this.warn(
      'The org:resources commands are currently in public beta, please report any issue to github.com/coveo/cli/issues'
    );
    this.printHeader();

    const snapshot = await this.getSnapshot();

    await this.monitorSnapshot(snapshot);
  }

  @Trackable()
  public async catch(err?: Error) {
    handleSnapshotError(err);
  }

  private async monitorSnapshot(snapshot: Snapshot) {
    const reporter = new SnapshotReporter(snapshot.latestReport);
    cli.action.start(`Operation ${reporter.type}`, reporter.status);
    await snapshot.waitUntilDone(this.waitOption);
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

  private printHeader() {
    const {args} = this.parse(Monitor);
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
    const {args, flags} = this.parse(Monitor);
    const snapshotId = args.snapshotId;
    const target = await getTargetOrg(this.configuration, flags.target);

    return SnapshotFactory.createFromExistingSnapshot(snapshotId, target);
  }

  private get waitOption(): WaitUntilDoneOptions {
    const {flags} = this.parse(Monitor);
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
