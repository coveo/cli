import {ResourceSnapshotsReportModel} from '@coveord/platform-client';
import {Flags, Command, CliUx} from '@oclif/core';
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
  public static description = '(beta) Monitor a Snapshot operation';

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
    this.warn(
      'The org:resources commands are currently in public beta, please report any issue to github.com/coveo/cli/issues'
    );
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

  private refresh(report: ResourceSnapshotsReportModel) {
    const reporter = new SnapshotReporter(report);
    CliUx.ux.action.status = reporter.status;
  }

  private async getSnapshot(): Promise<Snapshot> {
    const {args, flags} = await this.parse(Monitor);
    const snapshotId = args.snapshotId;
    const target = await getTargetOrg(this.configuration, flags.organization);

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
