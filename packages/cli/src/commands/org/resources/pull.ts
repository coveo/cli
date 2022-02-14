import {ResourceSnapshotType} from '@coveord/platform-client';
import {Flags, Command, CliUx} from '@oclif/core';
import {blueBright, bold} from 'chalk';
import {readJsonSync} from 'fs-extra';
import {cwd} from 'process';
import dedent from 'ts-dedent';
import {Config} from '../../../lib/config/config';
import {
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {IsGitInstalled} from '../../../lib/decorators/preconditions/git';
import {writeSnapshotPrivilege} from '../../../lib/decorators/preconditions/platformPrivilege';
import {Trackable} from '../../../lib/decorators/preconditions/trackable';
import {SnapshotOperationTimeoutError} from '../../../lib/errors';
import {ProcessAbort} from '../../../lib/errors/processError';
import {wait} from '../../../lib/flags/snapshotCommonFlags';
import {Project} from '../../../lib/project/project';
import type {
  SnapshotPullModel,
  SnapshotPullModelResources,
} from '../../../lib/snapshot/pullModel/interfaces';
import {buildResourcesToExport} from '../../../lib/snapshot/pullModel/validation/model';
import {validateSnapshotPullModel} from '../../../lib/snapshot/pullModel/validation/validate';
import {Snapshot, WaitUntilDoneOptions} from '../../../lib/snapshot/snapshot';
import {
  getTargetOrg,
  handleSnapshotError,
  cleanupProject,
} from '../../../lib/snapshot/snapshotCommon';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';
import {confirmWithAnalytics} from '../../../lib/utils/cli';
import {spawnProcess} from '../../../lib/utils/process';

export default class Pull extends Command {
  public static description = '(beta) Pull resources from an organization';

  public static flags = {
    ...wait(),
    target: Flags.string({
      char: 't',
      helpValue: 'targetorganizationg7dg3gd',
      required: false,
      description:
        'The unique identifier of the organization from which to pull the resources. If not specified, the organization you are connected to will be used.',
    }),
    snapshotId: Flags.string({
      char: 's',
      exclusive: ['resourceTypes'],
      description:
        'The unique identifier of the snapshot to pull. If not specified, a new snapshot will be created. You can list available snapshot in your organization with org:resources:list',
    }),
    git: Flags.boolean({
      char: 'g',
      description:
        'Whether to create a git repository when creating a new project.',
      default: true,
      allowNo: true,
    }),
    overwrite: Flags.boolean({
      char: 'o',
      description: 'Overwrite resources directory if it exists.',
      default: false,
    }),
    resourceTypes: Flags.build<ResourceSnapshotType>({
      parse: async (resourceType: ResourceSnapshotType) => resourceType,
    })({
      char: 'r',
      helpValue: 'type1 type2',
      description: 'The resources types to pull from the organization.',
      multiple: true,
      options: Object.values(ResourceSnapshotType),
      default: Object.values(ResourceSnapshotType),
    }),
    model: Flags.build<SnapshotPullModel>({
      parse: async (input: string): Promise<SnapshotPullModel> => {
        const model = readJsonSync(input);
        validateSnapshotPullModel(model);
        return model;
      },
    })({
      char: 'm',
      helpValue: 'path/to/snapshot.json',
      exclusive: ['snapshotId', 'resourceTypes', 'target'],
      description:
        'The path to a snapshot pull model. This flag is useful when you want to include only specific resource items in your snapshot (e.g., a subset of sources). Use the "org:resources:model:create" command to create a new Snapshot Pull Model',
    }),
  };

  @Trackable()
  @Preconditions(
    IsAuthenticated(),
    IsGitInstalled(),
    HasNecessaryCoveoPrivileges(writeSnapshotPrivilege)
  )
  public async run() {
    this.warn(
      'The org:resources commands are currently in public beta, please report any issue to github.com/coveo/cli/issues'
    );
    const targetOrganization = await this.getTargetOrg();
    const project = new Project(this.projectPath, targetOrganization);
    await this.ensureProjectReset(project);

    const snapshot = await this.getSnapshot();

    CliUx.ux.action.start('Updating project with Snapshot');
    await this.refreshProject(project, snapshot);

    await snapshot.delete();
    CliUx.ux.action.stop('Project updated');
  }

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    cleanupProject(this.projectPath);
    handleSnapshotError(err);
    await this.displayAdditionalErrorMessage(err);
  }

  private async displayAdditionalErrorMessage(
    err?: Error & {exitCode?: number}
  ) {
    if (err instanceof SnapshotOperationTimeoutError) {
      const snapshot = err.snapshot;
      const target = await this.getTargetOrg();
      this.log(
        dedent`

          Once the snapshot is created, you can pull it with the following command:

            ${blueBright`coveo org:resources:pull -t ${target} -s ${snapshot.id}`}

            `
      );
    }
  }

  private async refreshProject(project: Project, snapshot: Snapshot) {
    const {flags} = await this.parse(Pull);
    if (flags.git && !project.contains('.git')) {
      await spawnProcess('git', ['init', `${this.projectPath}`], {
        stdio: 'ignore',
      });
    }
    const snapshotBlob = await snapshot.download();
    await project.refresh(snapshotBlob);
  }

  private async ensureProjectReset(project: Project) {
    const {flags} = await this.parse(Pull);
    if (!flags.overwrite && project.contains(Project.resourceFolderName)) {
      const question = dedent`There is already a Coveo project with resources in it.
        This command will overwrite the ${Project.resourceFolderName} folder content, do you want to proceed? (y/n)`;

      const overwrite = await confirmWithAnalytics(
        question,
        'project overwrite'
      );
      if (!overwrite) {
        throw new ProcessAbort();
      }
    }

    project.reset();
  }

  private async getSnapshot() {
    const {flags} = await this.parse(Pull);
    const target = await this.getTargetOrg();
    if (flags.snapshotId) {
      CliUx.ux.action.start('Retrieving Snapshot');
      const waitOption = await this.getWaitOption();
      return SnapshotFactory.createFromExistingSnapshot(
        flags.snapshotId,
        target,
        waitOption
      );
    }
    const resourcesToExport = await this.getResourceSnapshotTypesToExport();
    CliUx.ux.action.start(`Creating Snapshot from ${bold.cyan(target)}`);
    const waitOption = await this.getWaitOption();
    return SnapshotFactory.createFromOrg(resourcesToExport, target, waitOption);
  }

  private async getWaitOption(): Promise<WaitUntilDoneOptions> {
    const {flags} = await this.parse(Pull);
    return {wait: flags.wait};
  }

  private get configuration() {
    return new Config(this.config.configDir);
  }

  private async getResourceSnapshotTypesToExport(): Promise<SnapshotPullModelResources> {
    const {flags} = await this.parse(Pull);
    if (flags.model) {
      const cfg = this.configuration.get();
      if (cfg.organization !== flags.model.orgId) {
        const question = dedent`You are currently connected to the ${bold.cyan(
          cfg.organization
        )} organization, but are about to pull resources from the ${bold.cyan(
          flags.model.orgId
        )} organization.
            Do you wish to continue? (y/n)`;
        const pull = await confirmWithAnalytics(question, 'resource pull');
        if (!pull) {
          throw new ProcessAbort();
        }
      }

      return flags.model.resourcesToExport;
    } else {
      return buildResourcesToExport(flags.resourceTypes);
    }
  }

  private async getTargetOrg() {
    const {flags} = await this.parse(Pull);
    return getTargetOrg(this.configuration, flags.model?.orgId || flags.target);
  }

  private get projectPath() {
    return cwd();
  }
}
