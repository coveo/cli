import {cli} from 'cli-ux';
import {Command, Flags} from '@oclif/core';
import {
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {Snapshot} from '../../../lib/snapshot/snapshot';
import {red, green, bold} from 'chalk';
import {SnapshotReporter} from '../../../lib/snapshot/snapshotReporter';
import {
  dryRun,
  getTargetOrg,
  handleReportWithErrors,
  // handleSnapshotError,
  cleanupProject,
  DryRunOptions,
} from '../../../lib/snapshot/snapshotCommon';
import {Config} from '../../../lib/config/config';
import {cwd} from 'process';
import {Project} from '../../../lib/project/project';
import {
  PreviewLevelValue,
  previewLevel,
  sync,
  wait,
} from '../../../lib/flags/snapshotCommonFlags';
import {
  writeLinkPrivilege,
  writeSnapshotPrivilege,
} from '../../../lib/decorators/preconditions/platformPrivilege';
import {Trackable} from '../../../lib/decorators/preconditions/trackable';

export default class Push extends Command {
  public static description =
    'Preview, validate and deploy your changes to the destination org';

  public static flags = {
    ...wait(),
    ...sync(),
    ...previewLevel(),
    target: Flags.string({
      char: 't',
      description:
        'The unique identifier of the organization where to send the changes. If not specified, the organization you are connected to will be used.',
      helpValue: 'destinationorganizationg7dg3gd',
      required: false,
    }),
    deleteMissingResources: Flags.boolean({
      char: 'd',
      description: 'Delete missing resources when enabled',
      default: false,
      required: false,
    }),
    skipPreview: Flags.boolean({
      char: 's',
      description:
        'Do not preview changes before applying them to the organization',
      default: false,
      required: false,
    }),
  };

  public static hidden = true;

  @Trackable()
  @Preconditions(
    IsAuthenticated(),
    HasNecessaryCoveoPrivileges(writeSnapshotPrivilege, writeLinkPrivilege)
  )
  public async run() {
    const {flags} = await this.parse(Push);
    const target = await getTargetOrg(this.configuration, flags.target);
    const cfg = await this.configuration.get();
    const {reporter, snapshot, project} = await dryRun(
      target,
      this.projectPath,
      cfg,
      await this.getOptions()
    );

    if (!flags.skipPreview) {
      await snapshot.preview(
        project,
        (
          await this.getOptions()
        ).deleteMissingResources,
        await this.shouldDisplayExpandedPreview()
      );
    }

    await this.processReportAndExecuteRemainingActions(snapshot, reporter);
    await this.cleanup(snapshot, project);
  }

  @Trackable()
  public async catch(err?: Record<string, unknown>) {
    cleanupProject(this.projectPath);
    // handleSnapshotError(err);
    throw err;
  }

  private async shouldDisplayExpandedPreview() {
    const {flags} = await this.parse(Push);
    return flags.previewLevel === PreviewLevelValue.Detailed;
  }

  private async processReportAndExecuteRemainingActions(
    snapshot: Snapshot,
    reporter: SnapshotReporter
  ) {
    if (!reporter.isSuccessReport()) {
      const cfg = await this.configuration.get();
      await handleReportWithErrors(snapshot, cfg, this.projectPath);
    }
    await this.handleValidReport(reporter, snapshot);
  }

  private async cleanup(snapshot: Snapshot, project: Project) {
    await snapshot.delete();
    project.deleteTemporaryZipFile();
  }

  private async handleValidReport(
    reporter: SnapshotReporter,
    snapshot: Snapshot
  ) {
    if (!reporter.hasChangedResources()) {
      return;
    }

    const {flags} = await this.parse(Push);
    const canBeApplied = flags.skipPreview || (await this.askForConfirmation());

    if (canBeApplied) {
      await this.applySnapshot(snapshot);
    }
  }

  private async askForConfirmation() {
    const {flags} = await this.parse(Push);
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
    const {flags} = await this.parse(Push);
    const reporter = await snapshot.apply(
      flags.deleteMissingResources,
      (
        await this.getOptions()
      ).waitUntilDone
    );
    const success = reporter.isSuccessReport();

    if (!success) {
      const cfg = await this.configuration.get();
      await handleReportWithErrors(snapshot, cfg, this.projectPath);
    }

    cli.action.stop(success ? green('✔') : red.bold('!'));
  }

  private async getOptions(): Promise<DryRunOptions> {
    const {flags} = await this.parse(Push);
    return {
      deleteMissingResources: flags.deleteMissingResources,
      waitUntilDone: {wait: flags.wait},
      sync: flags.sync,
    };
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  private get projectPath() {
    return cwd();
  }
}
