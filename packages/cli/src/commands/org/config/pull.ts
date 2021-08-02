import {ResourceSnapshotType} from '@coveord/platform-client';
import {flags, Command} from '@oclif/command';
import {IOptionFlag} from '@oclif/command/lib/flags';
import {blueBright} from 'chalk';
import {cli} from 'cli-ux';
import {cwd} from 'process';
import dedent from 'ts-dedent';
import {buildAnalyticsFailureHook} from '../../../hooks/analytics/analytics';
import {Config} from '../../../lib/config/config';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {IsGitInstalled} from '../../../lib/decorators/preconditions/git';
import {SnapshotOperationTimeoutError} from '../../../lib/errors';
import {Project} from '../../../lib/project/project';
import {Snapshot, WaitUntilDoneOptions} from '../../../lib/snapshot/snapshot';
import {
  waitFlag,
  getTargetOrg,
  handleSnapshotError,
} from '../../../lib/snapshot/snapshotCommon';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';
import {spawnProcess} from '../../../lib/utils/process';

export default class Pull extends Command {
  public static description = 'Pull resources from an organization';

  public static flags = {
    ...waitFlag,
    target: flags.string({
      char: 't',
      helpValue: 'destinationorganizationg7dg3gd',
      required: false,
      description:
        'The unique identifier of the organization from which to pull the resources. If not specified, the organization you are connected to will be used.',
    }),
    resourceTypes: flags.string({
      char: 'r',
      helpValue: 'type1 type2',
      options: Object.keys(ResourceSnapshotType),
      default: Object.keys(ResourceSnapshotType),
      multiple: true,
      description: 'The resources types to pull from the organization.',
    }) as IOptionFlag<(keyof typeof ResourceSnapshotType)[]>,
    snapshotId: flags.string({
      char: 's',
      exclusive: ['resourceTypes'],
      description:
        'The unique identifier of the snapshot to pull. If not specified, a new snapshot will be created. You can list available snapshot in your organization with org:config:list',
    }),
    git: flags.boolean({
      char: 'g',
      description:
        'Whether to create a git repository when creating a new project.',
      default: true,
      allowNo: true,
    }),
  };

  public static hidden = true;

  @Preconditions(IsAuthenticated(), IsGitInstalled())
  public async run() {
    const snapshot = await this.getSnapshot();

    cli.action.start('Updating project with Snapshot');
    await this.refreshProject(snapshot);

    await snapshot.delete();
    cli.action.stop('Project updated');
  }

  public async catch(err?: Error) {
    const {flags} = this.parse(Pull);
    handleSnapshotError(err);
    await this.displayAdditionalErrorMessage(err);
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
  }

  private async displayAdditionalErrorMessage(err?: Error) {
    if (err instanceof SnapshotOperationTimeoutError) {
      const {flags} = this.parse(Pull);
      const snapshot = err.snapshot;
      const target = await getTargetOrg(this.configuration, flags.target);
      cli.log(
        dedent`

          Once the snapshot is created, you can pull it with the following command:

            ${blueBright`coveo org:config:pull -t ${target} -s ${snapshot.id}`}

            `
      );
    }
  }

  private async refreshProject(snapshot: Snapshot) {
    const {flags} = this.parse(Pull);
    const project = new Project(this.projectPath);
    if (flags.git && !project.contains('.git')) {
      await spawnProcess('git', ['init', `${this.projectPath}`], {
        stdio: 'ignore',
      });
    }
    const snapshotBlob = await snapshot.download();
    await project.refresh(snapshotBlob);
  }

  private async getSnapshot() {
    const {flags} = this.parse(Pull);
    const target = await getTargetOrg(this.configuration, flags.target);
    if (flags.snapshotId) {
      cli.action.start('Retrieving Snapshot');
      return SnapshotFactory.createFromExistingSnapshot(
        flags.snapshotId,
        target,
        this.waitOption
      );
    }
    cli.action.start('Creating Snapshot');
    return SnapshotFactory.createFromOrg(
      this.ResourceSnapshotTypesToExport,
      target,
      this.waitOption
    );
  }

  private get waitOption(): WaitUntilDoneOptions {
    const {flags} = this.parse(Pull);
    return {wait: flags.wait === 0 ? Infinity : flags.wait};
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  private get ResourceSnapshotTypesToExport() {
    const {flags} = this.parse(Pull);
    return flags.resourceTypes.map((type) => ResourceSnapshotType[type]);
  }

  private get projectPath() {
    return cwd();
  }
}
