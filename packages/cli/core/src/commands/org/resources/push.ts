import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Flags, CliUx} from '@oclif/core';
import {
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
  Preconditions,
} from '@coveo/cli-commons/preconditions/index';
import {Snapshot} from '../../../lib/snapshot/snapshot';
import {red, green, bold} from 'chalk';
import {SnapshotReporter} from '../../../lib/snapshot/snapshotReporter';
import {
  dryRun,
  getTargetOrg,
  handleReportWithErrors,
  cleanupProject,
  DryRunOptions,
  getMissingVaultEntriesReportHandler,
  getErrorReportHandler,
} from '../../../lib/snapshot/snapshotCommon';
import {Config} from '@coveo/cli-commons/config/config';
import {cwd} from 'process';
import {Project} from '../../../lib/project/project';
import {
  PreviewLevelValue,
  previewLevel,
  wait,
  organization,
} from '../../../lib/flags/snapshotCommonFlags';
import {
  writeLinkPrivilege,
  writeSnapshotPrivilege,
} from '@coveo/cli-commons/preconditions/platformPrivilege';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {confirmWithAnalytics} from '../../../lib/utils/cli';
import {SnapshotReportStatus} from '../../../lib/snapshot/reportPreviewer/reportPreviewerDataModels';

export default class Push extends CLICommand {
  public static description =
    'Preview, validate and deploy your changes to the destination org';

  public static flags = {
    ...wait(),
    ...previewLevel(),
    ...organization(
      'The unique identifier of the organization where to send the changes'
    ),
    deleteMissingResources: Flags.boolean({
      description: 'Delete missing resources when enabled',
      default: false,
      required: false,
    }),
  };

  @Trackable()
  @Preconditions(
    IsAuthenticated(),
    HasNecessaryCoveoPrivileges(writeSnapshotPrivilege, writeLinkPrivilege)
  )
  public async run() {
    const {flags} = await this.parse(Push);
    const target = getTargetOrg(this.configuration, flags.organization);
    const cfg = this.configuration.get();
    const options = await this.getOptions();
    const {reporter, snapshot, project} = await dryRun(
      target,
      this.projectPath,
      options
    );

    const shouldSkip = await this.shouldSkipPreview();
    if (!shouldSkip) {
      const display = await this.shouldDisplayExpandedPreview();
      const {deleteMissingResources} = await this.getOptions();
      await snapshot.preview(project, deleteMissingResources, display);
    }
    await reporter
      .setReportHandler(
        SnapshotReportStatus.SUCCESS,
        this.getSuccessReportHandler(snapshot)
      )
      .setReportHandler(
        SnapshotReportStatus.MISSING_VAULT_ENTRIES,
        getMissingVaultEntriesReportHandler(snapshot, cfg, this.projectPath)
      )
      .setReportHandler(
        SnapshotReportStatus.ERROR,
        getErrorReportHandler(snapshot, cfg, this.projectPath)
      )
      .handleReport();
    await this.cleanup(snapshot, project);
  }

  public async catch(err?: Error & {exitCode?: number}) {
    cleanupProject(this.projectPath);
    return super.catch(err);
  }

  private async shouldSkipPreview() {
    const {flags} = await this.parse(Push);
    return flags.previewLevel === PreviewLevelValue.None;
  }

  private async shouldDisplayExpandedPreview() {
    const {flags} = await this.parse(Push);
    return flags.previewLevel === PreviewLevelValue.Detailed;
  }

  private async cleanup(snapshot: Snapshot, project: Project) {
    await snapshot.delete();
    project.deleteTemporaryZipFile();
  }

  private getSuccessReportHandler(snapshot: Snapshot) {
    const successReportWithChangesHandler = () =>
      this.successReportWithChangesHandler(snapshot);
    return async function (this: SnapshotReporter) {
      return successReportWithChangesHandler();
    };
  }

  private async successReportWithChangesHandler(snapshot: Snapshot) {
    const canBeApplied =
      (await this.shouldSkipPreview()) || (await this.askForConfirmation());

    if (canBeApplied) {
      await this.applySnapshot(snapshot);
    }
  }

  private async askForConfirmation(): Promise<boolean> {
    const {flags} = await this.parse(Push);
    const target = getTargetOrg(this.configuration, flags.organization);
    const question = `\nWould you like to apply the snapshot to the organization ${bold.cyan(
      target
    )}? (y/n)`;
    return confirmWithAnalytics(question, 'snapshot apply');
  }

  private async applySnapshot(snapshot: Snapshot) {
    CliUx.ux.action.start('Applying snapshot');
    const cfg = this.configuration.get();
    const {flags} = await this.parse(Push);
    const {waitUntilDone} = await this.getOptions();
    const reporter = await snapshot.apply(
      flags.deleteMissingResources,
      waitUntilDone
    );
    await reporter
      .setReportHandler(SnapshotReportStatus.ERROR, async () => {
        await handleReportWithErrors(snapshot, cfg, this.projectPath);
        CliUx.ux.action.stop(red.bold('!'));
      })
      .setReportHandler(SnapshotReportStatus.SUCCESS, () => {
        CliUx.ux.action.stop(green('✔'));
      })
      .handleReport();
  }

  private async getOptions(): Promise<DryRunOptions> {
    const {flags} = await this.parse(Push);
    return {
      deleteMissingResources: flags.deleteMissingResources,
      waitUntilDone: {wait: flags.wait},
    };
  }

  private get configuration() {
    return new Config(this.config.configDir);
  }

  private get projectPath() {
    return cwd();
  }
}
