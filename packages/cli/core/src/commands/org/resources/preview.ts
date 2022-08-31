import {Command, Flags} from '@oclif/core';
import {blueBright} from 'chalk';
import {cwd} from 'process';
import dedent from 'ts-dedent';
import {Config} from '@coveo/cli-commons/src/config/config';
import {
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
  Preconditions,
} from '@coveo/cli-commons/src/preconditions';
import {IsGitInstalled} from '../../../lib/decorators/preconditions/git';
import {
  writeLinkPrivilege,
  writeSnapshotPrivilege,
} from '@coveo/cli-commons/src/preconditions/platformPrivilege';
import {Trackable} from '@coveo/cli-commons/src/preconditions/trackable';
import {SnapshotOperationTimeoutError} from '../../../lib/errors';
import {
  PreviewLevelValue,
  previewLevel,
  wait,
  organization,
  snapshotId,
} from '../../../lib/flags/snapshotCommonFlags';
import {Project} from '../../../lib/project/project';
import {SnapshotReportStatus} from '../../../lib/snapshot/reportPreviewer/reportPreviewerDataModels';
import {Snapshot} from '../../../lib/snapshot/snapshot';
import {
  dryRun,
  getTargetOrg,
  handleSnapshotError,
  DryRunOptions,
  cleanupProject,
  getMissingVaultEntriesReportHandler,
  getErrorReportHandler,
} from '../../../lib/snapshot/snapshotCommon';
export default class Preview extends Command {
  public static description = 'Preview resource updates';

  public static flags = {
    ...wait(),
    ...previewLevel(),
    ...organization(
      'The unique identifier of the organization where to preview the changes'
    ),
    ...snapshotId(),
    showMissingResources: Flags.boolean({
      char: 'd',
      description: 'Preview resources deletion when enabled',
      default: false,
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
    const {flags} = await this.parse(Preview);
    const target = await getTargetOrg(this.configuration, flags.organization);
    const cfg = this.configuration.get();
    const options = await this.getOptions();
    const {reporter, snapshot, project} = await dryRun(
      target,
      this.projectPath,
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

  private async shouldDeleteSnapshot() {
    return !(await this.parse(Preview)).flags.snapshotId;
  }
  private async cleanup(snapshot: Snapshot, project: Project) {
    if (await this.shouldDeleteSnapshot()) {
      await snapshot.delete();
    }
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

            ${blueBright`coveo org:resources:preview -o ${target} -s ${snapshot.id}`}

            `
      );
    }
  }

  private async getOptions(): Promise<DryRunOptions> {
    const {flags} = await this.parse(Preview);
    return {
      deleteMissingResources: flags.showMissingResources,
      waitUntilDone: {wait: flags.wait},
      ...(flags.snapshotId && {snapshotId: flags.snapshotId}),
    };
  }

  private get configuration() {
    return new Config(this.config.configDir);
  }

  private get projectPath() {
    return cwd();
  }
}