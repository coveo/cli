import {ResourceSnapshotsReportModel} from '@coveord/platform-client';
import {flags} from '@oclif/command';
import {cli} from 'cli-ux';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {ReportViewerStyles} from '../../../lib/snapshot/reportViewer/reportViewerStyles';
import {Snapshot, waitUntilDoneOptions} from '../../../lib/snapshot/snapshot';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';
import SnapshotBase from './orgConfigBase';

export default class Monitor extends SnapshotBase {
  public static description = 'Monitor a Snapshot operation';

  public static flags = {
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
  }

  private async monitorSnapshot(snapshot: Snapshot) {
    cli.action.start(
      `Operation: ${this.getReportType(snapshot.latestReport)}`,
      this.getReportStatus(snapshot.latestReport)
    );

    // TODO: revisit with a progress bar once the response contains the remaining resources to process
    const iteratee = (report: ResourceSnapshotsReportModel) =>
      this.refresh(report);
    await snapshot.waitUntilDone(this.waitOptions, iteratee);

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
    const {args} = this.parse(Monitor);
    const snapshotId = args.snapshotId;
    const target = await this.getTargetOrg();

    return SnapshotFactory.createFromExistingSnapshot(snapshotId, target);
  }

  private get waitOptions(): waitUntilDoneOptions {
    return {
      waitOptions: {
        numOfAttempts: Infinity,
        delayFirstAttempt: false,
        maxDelay: 10e3,
      },
    };
  }
}
