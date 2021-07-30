import {ResourceSnapshotsReportModel} from '@coveord/platform-client';
import {flags, Command} from '@oclif/command';
import {cli} from 'cli-ux';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';
import {Config} from '../../../lib/config/config';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {ReportViewerStyles} from '../../../lib/snapshot/reportViewer/reportViewerStyles';
import {Snapshot, WaitUntilDoneOptions} from '../../../lib/snapshot/snapshot';
import {
  waitFlag,
  getTargetOrg,
  handleSnapshotError,
} from '../../../lib/snapshot/snapshotCommon';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';

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
    const snapshot = await this.getSnapshot();

    this.printHeader(snapshot.id);

    await this.monitorSnapshot(snapshot);
    this.config.runHook('analytics', buildAnalyticsSuccessHook(this, flags));
  }

  public async catch(err?: Error) {
    const {flags} = this.parse(Monitor);
    handleSnapshotError(err);
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
  }

  private async monitorSnapshot(snapshot: Snapshot) {
    cli.action.start(
      `Operation: ${this.getReportType(snapshot.latestReport)}`,
      this.getReportStatus(snapshot.latestReport)
    );

    // TODO: revisit with a progress bar once the response contains the remaining resources to process
    const iteratee = (report: ResourceSnapshotsReportModel) =>
      this.refresh(report);
    await snapshot.waitUntilDone(null, this.waitOption, iteratee);

    cli.action.stop(this.getReportStatus(snapshot.latestReport));
  }

  private printHeader(snapshotId: string) {
    const header = ReportViewerStyles.header(
      `\nMonitoring snapshot ${snapshotId}:`
    );
    cli.log(header);
  }

  private prettyPrint(str: string): string {
    const capitalized = str.charAt(0) + str.slice(1).toLowerCase();
    return capitalized.replace(/_/g, ' ');
  }

  private getReportType(report: ResourceSnapshotsReportModel) {
    const type = this.prettyPrint(report.type);
    return type;
  }

  private getReportStatus(report: ResourceSnapshotsReportModel) {
    const status = this.prettyPrint(report.status);
    return status;
  }

  private refresh(report: ResourceSnapshotsReportModel) {
    const status = this.getReportStatus(report);
    cli.action.status = status;
  }

  private async getSnapshot(): Promise<Snapshot> {
    const {args, flags} = this.parse(Monitor);
    const snapshotId = args.snapshotId;
    const target = await getTargetOrg(this.configuration, flags.target);

    return SnapshotFactory.createFromExistingSnapshot(snapshotId, target);
  }

  private get waitOption(): WaitUntilDoneOptions {
    const {flags} = this.parse(Monitor);
    return {wait: flags.wait === 0 ? Infinity : flags.wait};
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }
}
