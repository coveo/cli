import {ResourceSnapshotsReportModel} from '@coveord/platform-client';
import {flags, Command} from '@oclif/command';
import {cli} from 'cli-ux';
import dedent from 'ts-dedent';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';
import {Config} from '../../../lib/config/config';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {ReportViewerStyles} from '../../../lib/snapshot/reportPreviewer/reportPreviewerStyles';
import {Snapshot, WaitUntilDoneOptions} from '../../../lib/snapshot/snapshot';
import {
  waitFlag,
  getTargetOrg,
  handleSnapshotError,
} from '../../../lib/snapshot/snapshotCommon';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';
import {SnapshotReporter} from '../../../lib/snapshot/snapshotReporter';
import {SnapshotUrlBuilder} from '../../../lib/snapshot/snapshotUrlBuilder';

export default class Monitor extends Command {
  public static description = 'Monitor a Snapshot operation';

  public static flags = {
    ...waitFlag,
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

  public static hidden = true;

  @Preconditions(IsAuthenticated())
  public async run() {
    this.printHeader();

    const snapshot = await this.getSnapshot();

    await this.monitorSnapshot(snapshot);
    this.config.runHook('analytics', buildAnalyticsSuccessHook(this, flags));
  }

  public async catch(err?: Error) {
    const {flags} = this.parse(Monitor);
    handleSnapshotError(this.projectPath, err);
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
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
      await this.displaySnapshotError(snapshot, reporter);
    }
  }

  // TODO: CDX-533: use Custom error instead
  private async displaySnapshotError(
    snapshot: Snapshot,
    reporter: SnapshotReporter
  ) {
    cli.log(ReportViewerStyles.error(reporter.resultCode));
    cli.log();
    const cfg = await this.configuration.get();
    const urlBuilder = new SnapshotUrlBuilder(cfg);
    const snapshotUrl = urlBuilder.getSnapshotPage(snapshot);

    cli.error(
      dedent`Invalid snapshot - ${snapshot.latestReport.resultCode}.

        You can also use this link to view the snapshot in the Coveo Admin Console:
        ${snapshotUrl}`
    );
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
