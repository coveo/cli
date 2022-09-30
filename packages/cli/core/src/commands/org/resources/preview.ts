import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Flags} from '@oclif/core';
import {blueBright} from 'chalk';
import {cwd} from 'process';
import dedent from 'ts-dedent';
import {Config} from '@coveo/cli-commons/config/config';
import {
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
  Preconditions,
} from '@coveo/cli-commons/preconditions/index';
import {IsGitInstalled} from '../../../lib/decorators/preconditions/git';
import {
  writeLinkPrivilege,
  writeSnapshotPrivilege,
} from '@coveo/cli-commons/preconditions/platformPrivilege';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
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
  DryRunOptions,
  cleanupProject,
  getMissingVaultEntriesReportHandler,
  getErrorReportHandler,
} from '../../../lib/snapshot/snapshotCommon';
export default class Preview extends CLICommand {
  public static description =
    'Preview the changes that running `coveo org:resources:push` would cause';

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

  public static examples = [
    'coveo org:resources:preview',
    'coveo org:resources:preview -o=myOrgId',
    'coveo org:resources:preview -o=myOrgId -d',
  ];

  @Trackable()
  @Preconditions(
    IsAuthenticated(),
    IsGitInstalled(),
    HasNecessaryCoveoPrivileges(writeSnapshotPrivilege, writeLinkPrivilege)
  )
  public async run() {
    const {flags} = await this.parse(Preview);
    const target = getTargetOrg(this.configuration, flags.organization);
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

  public async catch(err?: Error & {exitCode?: number}) {
    cleanupProject(this.projectPath);
    await this.supplementErrorMessage(err);
    return super.catch(err);
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

  private async supplementErrorMessage(err?: Error & {exitCode?: number}) {
    if (err instanceof SnapshotOperationTimeoutError) {
      const {flags} = await this.parse(Preview);
      const snapshot = err.snapshot;
      const target = getTargetOrg(this.configuration, flags.organization);
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
