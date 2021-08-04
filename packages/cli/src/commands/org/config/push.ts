import {cli} from 'cli-ux';
import {flags, Command} from '@oclif/command';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {Snapshot} from '../../../lib/snapshot/snapshot';
import {red, green, bold} from 'chalk';
import {SnapshotReporter} from '../../../lib/snapshot/snapshotReporter';
import {
  displayInvalidSnapshotError,
  displaySnapshotSynchronizationWarning,
  dryRun,
  DryRunOptions,
  getTargetOrg,
  handleSnapshotError,
} from '../../../lib/snapshot/snapshotCommon';
import {Config} from '../../../lib/config/config';
import {cwd} from 'process';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';

export default class Push extends Command {
  public static description =
    'Preview, validate and deploy your changes to the destination org';

  public static flags = {
    target: flags.string({
      char: 't',
      description:
        'The unique identifier of the organization where to send the changes. If not specified, the organization you are connected to will be used.',
      helpValue: 'destinationorganizationg7dg3gd',
      required: false,
    }),
    deleteMissingResources: flags.boolean({
      char: 'd',
      description: 'Whether or not to delete missing resources',
      default: false,
      required: false,
    }),
    skipPreview: flags.boolean({
      char: 's',
      description:
        'Do not preview changes before applying them to the organization',
      default: false,
      required: false,
    }),
  };

  public static hidden = true;

  @Preconditions(IsAuthenticated())
  public async run() {
    const {flags} = this.parse(Push);
    const target = await getTargetOrg(this.configuration, flags.target);
    const options: DryRunOptions = {
      deleteMissingResources: flags.deleteMissingResources,
    };
    const {reporter, snapshot, project} = await dryRun(
      target,
      this.projectPath,
      options
    );

    if (!flags.skipPreview) {
      await snapshot.preview();
    }

    if (reporter.isSuccessReport()) {
      await this.handleValidReport(reporter, snapshot);
      await snapshot.delete();
    } else {
      await this.handleReportWithErrors(snapshot);
    }

    project.deleteTemporaryZipFile();

    this.config.runHook('analytics', buildAnalyticsSuccessHook(this, flags));
  }

  public async catch(err?: Error) {
    const {flags} = this.parse(Push);
    handleSnapshotError(err);
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
  }

  private async handleValidReport(
    reporter: SnapshotReporter,
    snapshot: Snapshot
  ) {
    if (!reporter.hasChangedResources()) {
      return;
    }

    const {flags} = this.parse(Push);
    const canBeApplied = flags.skipPreview || (await this.askForConfirmation());

    if (canBeApplied) {
      await this.applySnapshot(snapshot);
    }
  }

  private async askForConfirmation() {
    const {flags} = this.parse(Push);
    const target = await getTargetOrg(this.configuration, flags.target);
    const canBeApplied = await cli.confirm(
      `\nWould you like to apply these changes to the org ${bold(
        target
      )}? (y/n)`
    );
    return canBeApplied;
  }

  private async applySnapshot(snapshot: Snapshot) {
    cli.action.start('Applying snapshot');
    const {flags} = this.parse(Push);
    const reporter = await snapshot.apply(flags.deleteMissingResources);
    const success = reporter.isSuccessReport();

    if (!success) {
      await this.handleReportWithErrors(snapshot);
    }

    cli.action.stop(success ? green('✔') : red.bold('!'));
  }

  private async handleReportWithErrors(snapshot: Snapshot) {
    const cfg = await this.configuration.get();

    if (snapshot.requiresSynchronization()) {
      displaySnapshotSynchronizationWarning(snapshot, cfg);
      return;
    }

    displayInvalidSnapshotError(snapshot, cfg, this.projectPath);
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  private get projectPath() {
    return cwd();
  }
}
