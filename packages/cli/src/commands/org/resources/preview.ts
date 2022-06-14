import {Command, Flags} from '@oclif/core';
import chalk from 'chalk';
import {cwd} from 'process';
import {dedent} from 'ts-dedent';
import {Config} from '../../../lib/config/config.js';
import {
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions/index.js';
import {IsGitInstalled} from '../../../lib/decorators/preconditions/git.js';
import {
  writeLinkPrivilege,
  writeSnapshotPrivilege,
} from '../../../lib/decorators/preconditions/platformPrivilege.js';
import {Trackable} from '../../../lib/decorators/preconditions/trackable.js';
import {SnapshotOperationTimeoutError} from '../../../lib/errors/index.js';
import {
  PreviewLevelValue,
  previewLevel,
  sync,
  wait,
  organization,
} from '../../../lib/flags/snapshotCommonFlags.js';
import {Project} from '../../../lib/project/project.js';
import {SnapshotReportStatus} from '../../../lib/snapshot/reportPreviewer/reportPreviewerDataModels.js';
import {Snapshot} from '../../../lib/snapshot/snapshot.js';
import {
  dryRun,
  getTargetOrg,
  handleSnapshotError,
  DryRunOptions,
  cleanupProject,
  getMissingVaultEntriesReportHandler,
  getErrorReportHandler,
} from '../../../lib/snapshot/snapshotCommon.js';
export default class Preview extends Command {
  public static description = '(beta) Preview resource updates';

  public static flags = {
    ...wait(),
    ...sync(),
    ...previewLevel(),
    ...organization(
      'The unique identifier of the organization where to preview the changes'
    ),
    showMissingResources: Flags.boolean({
      char: 'd',
      description: 'Preview resources deletion when enabled',
      default: false,
      required: false,
    }),
    snapshotId: Flags.string({
      char: 's',
      description:
        'The unique identifier of the snapshot to preview. If not specified, a new snapshot will be created from your local project. You can list available snapshots in your organization with org:resources:list',
      required: false,
    }),
  };

  @Trackable()
  @Preconditions(
    IsAuthenticated(),
    IsGitInstalled(),
    HasNecessaryCoveoPrivileges(writeSnapshotPrivilege, writeLinkPrivilege)
  )
  public async run() {
    this.warn(
      'The org:resources commands are currently in public beta, please report any issue to github.com/coveo/cli/issues'
    );
    const {flags} = await this.parse(Preview);
    const target = await getTargetOrg(this.configuration, flags.organization);
    const cfg = this.configuration.get();
    const options = await this.getOptions();
    const {reporter, snapshot, project} = await dryRun(
      target,
      this.projectPath,
      cfg,
      options
    );

    const display = await this.shouldDisplayExpandedPreview();
    const {deleteMissingResources} = await this.getOptions();
    await snapshot.preview(project, deleteMissingResources, display);
    await reporter
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
    await this.displayAdditionalErrorMessage(err);
  }

  private async shouldDisplayExpandedPreview() {
    const {flags} = await this.parse(Preview);
    return flags.previewLevel === PreviewLevelValue.Detailed;
  }

  private async cleanup(snapshot: Snapshot, project: Project) {
    await snapshot.delete();
    project.deleteTemporaryZipFile();
  }

  private async displayAdditionalErrorMessage(
    err?: Error & {exitCode?: number}
  ) {
    if (err instanceof SnapshotOperationTimeoutError) {
      const {flags} = await this.parse(Preview);
      const snapshot = err.snapshot;
      const target = await getTargetOrg(this.configuration, flags.organization);
      this.log(
        dedent`

          Once the snapshot is created, you can preview it with the following command:

            ${chalk.blueBright`coveo org:resources:preview -t ${target} -s ${snapshot.id}`}

            `
      );
    }
  }

  private async getOptions(): Promise<DryRunOptions> {
    const {flags} = await this.parse(Preview);
    return {
      deleteMissingResources: flags.showMissingResources,
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
