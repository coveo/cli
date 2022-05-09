import {Flags, Command, CliUx} from '@oclif/core';
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
  handleSnapshotError,
  cleanupProject,
  DryRunOptions,
  getMissingVaultEntriesReportHandler,
  getErrorReportHandler,
} from '../../../lib/snapshot/snapshotCommon';
import {Config} from '../../../lib/config/config';
import {cwd} from 'process';
import {Project} from '../../../lib/project/project';
import {
  PreviewLevelValue,
  previewLevel,
  sync,
  wait,
  organization,
} from '../../../lib/flags/snapshotCommonFlags';
import {
  writeLinkPrivilege,
  writeSnapshotPrivilege,
} from '../../../lib/decorators/preconditions/platformPrivilege';
import {Trackable} from '../../../lib/decorators/preconditions/trackable';
import {confirmWithAnalytics} from '../../../lib/utils/cli';
import {SnapshotReportStatus} from '../../../lib/snapshot/reportPreviewer/reportPreviewerDataModels';

export default class Push extends Command {
  public static description =
    '(beta) Preview, validate and deploy your changes to the destination org';

  public static flags = {
    ...wait(),
    ...sync(),
    ...previewLevel(),
    ...organization(
      'The unique identifier of the organization where to send the changes'
    ),
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

  @Trackable()
  @Preconditions(
    IsAuthenticated(),
    HasNecessaryCoveoPrivileges(writeSnapshotPrivilege, writeLinkPrivilege)
  )
  public async run() {
    this.warn(
      'The org:resources commands are currently in public beta, please report any issue to github.com/coveo/cli/issues'
    );
    const {flags} = await this.parse(Push);
    const target = await getTargetOrg(this.configuration, flags.organization);
    const cfg = this.configuration.get();
    const options = await this.getOptions();
    const {reporter, snapshot, project} = await dryRun(
      target,
      this.projectPath,
      cfg,
      options
    );

    if (!flags.skipPreview) {
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

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    cleanupProject(this.projectPath);
    handleSnapshotError(err);
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
    const {flags} = await this.parse(Push);
    const canBeApplied = flags.skipPreview || (await this.askForConfirmation());

    if (canBeApplied) {
      await this.applySnapshot(snapshot);
    }
  }

  private async askForConfirmation(): Promise<boolean> {
    const {flags} = await this.parse(Push);
    const target = await getTargetOrg(this.configuration, flags.organization);
    const question = `\nWould you like to apply these changes to the org ${bold(
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
      sync: flags.sync,
    };
  }

  private get configuration() {
    return new Config(this.config.configDir);
  }

  private get projectPath() {
    return cwd();
  }
}
