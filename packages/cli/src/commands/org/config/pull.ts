import {ResourceType} from '@coveord/platform-client';
import {flags, Command} from '@oclif/command';
import {cwd} from 'process';
import {Config} from '../../../lib/config/config';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {Project} from '../../../lib/project/project';
import {Snapshot} from '../../../lib/snapshot/snapshot';
import {getTargetOrg} from '../../../lib/snapshot/snapshotCommon';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';

export default class Pull extends Command {
  public static description = 'Pull resources from an organization';

  public static flags = {
    target: flags.string({
      char: 't',
      description:
        'The unique identifier of the organization from which to pull the resources. If not specified, the organization you are connected to will be used.',
      helpValue: 'destinationorganizationg7dg3gd',
      required: false,
    }),
    // TODO: CDX-447: add flag to select resource types to export
  };

  public static hidden = true;

  @Preconditions(IsAuthenticated())
  public async run() {
    const snapshot = await this.getSnapshot();

    await this.refreshProject(snapshot);
    await snapshot.delete();
  }

  private async refreshProject(snapshot: Snapshot) {
    const project = new Project(this.projectPath);
    const snapshotBlob = await snapshot.download();
    await project.refresh(snapshotBlob);
  }

  private async getSnapshot() {
    const {flags} = this.parse(Pull);
    const target = await getTargetOrg(this.configuration, flags.target);
    return SnapshotFactory.createFromOrg(this.resourceTypesToExport, target);
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  private get resourceTypesToExport(): ResourceType[] {
    throw new Error('not implemented yet');
  }

  private get projectPath() {
    return cwd();
  }
}
