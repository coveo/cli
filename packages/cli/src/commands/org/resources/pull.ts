import {ResourceSnapshotType} from '@coveord/platform-client';
import {Command, Flags} from '@oclif/core';
import {OptionFlag} from '@oclif/core/lib/interfaces';

import {blueBright} from 'chalk';
import {cli} from 'cli-ux';
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
import {wait} from '../../../lib/flags/snapshotCommonFlags';
import {Project} from '../../../lib/project/project';
import {Snapshot, WaitUntilDoneOptions} from '../../../lib/snapshot/snapshot';
import {
  getTargetOrg,
  // handleSnapshotError,
  cleanupProject,
} from '../../../lib/snapshot/snapshotCommon';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';
import {spawnProcess} from '../../../lib/utils/process';

export default class Pull extends Command {
  public static description = 'Pull resources from an organization';

  public static flags = {
    ...wait(),
    target: Flags.string({
      char: 't',
      helpValue: 'destinationorganizationg7dg3gd',
      required: false,
      description:
        'The unique identifier of the organization from which to pull the resources. If not specified, the organization you are connected to will be used.',
    }),
    resourceTypes: Flags.string({
      char: 'r',
      helpValue: 'type1 type2',
      options: Object.keys(ResourceSnapshotType),
      default: Object.keys(ResourceSnapshotType),
      multiple: true,
      description: 'The resources types to pull from the organization.',
    }) as OptionFlag<(keyof typeof ResourceSnapshotType)[]>,
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
  };

  public static hidden = true;

  @Trackable()
  @Preconditions(
    IsAuthenticated(),
    IsGitInstalled(),
    HasNecessaryCoveoPrivileges(writeSnapshotPrivilege)
  )
  public async run() {
    const project = new Project(this.projectPath);
    await this.ensureProjectReset(project);

    const snapshot = await this.getSnapshot();

    cli.action.start('Updating project with Snapshot');
    await this.refreshProject(project, snapshot);

    await snapshot.delete();
    cli.action.stop('Project updated');
  }

  @Trackable()
  public async catch(err?: Record<string, unknown>) {
    cleanupProject(this.projectPath);
    // handleSnapshotError(err);
    // await this.displayAdditionalErrorMessage(err);
    throw err;
  }

  private async displayAdditionalErrorMessage(err?: Error) {
    if (err instanceof SnapshotOperationTimeoutError) {
      const {flags} = await this.parse(Pull);
      const snapshot = err.snapshot;
      const target = await getTargetOrg(this.configuration, flags.target);
      cli.log(
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
      const overwrite =
        await cli.confirm(dedent`There is already a Coveo project with resources in it.
        This command will overwrite the ${Project.resourceFolderName} folder content, do you want to proceed? (y/n)`);

      if (!overwrite) {
        this.exit();
      }
    }

    project.reset();
  }

  private async getSnapshot() {
    const {flags} = await this.parse(Pull);
    const target = await getTargetOrg(this.configuration, flags.target);
    if (flags.snapshotId) {
      cli.action.start('Retrieving Snapshot');
      return SnapshotFactory.createFromExistingSnapshot(
        flags.snapshotId,
        target,
        await this.getWaitOption()
      );
    }
    cli.action.start('Creating Snapshot');
    return SnapshotFactory.createFromOrg(
      await this.getResourceSnapshotTypesToExport(),
      target,
      await this.getWaitOption()
    );
  }

  private async getWaitOption(): Promise<WaitUntilDoneOptions> {
    const {flags} = await this.parse(Pull);
    return {wait: flags.wait};
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  private async getResourceSnapshotTypesToExport() {
    const {flags} = await this.parse(Pull);
    return flags.resourceTypes.map(
      (type) => ResourceSnapshotType[type] as ResourceSnapshotType
    );
  }

  private get projectPath() {
    return cwd();
  }
}
