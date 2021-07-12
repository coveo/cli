import {DryRunOptions} from '@coveord/platform-client';
import {Command, flags} from '@oclif/command';
import {cwd} from 'process';
import {Config} from '../../../lib/config/config';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {Snapshot} from '../../../lib/snapshot/snapshot';
import {
  displayInvalidSnapshotError,
  displaySnapshotSynchronizationWarning,
  dryRun,
  getTargetOrg,
} from '../../../lib/snapshot/snapshotCommon';

export default class Preview extends Command {
  public static description = 'Preview resource updates';

  public static flags = {
    target: flags.string({
      char: 't',
      description:
        'The unique identifier of the organization where to send the changes. If not specified, the organization you are connected to will be used.',
      helpValue: 'destinationorganizationg7dg3gd',
      required: false,
    }),
    showMissingResources: flags.boolean({
      char: 'd',
      description: 'Whether or not preview missing resources',
      default: false,
      required: false,
    }),
  };

  public static hidden = true;

  @Preconditions(IsAuthenticated())
  public async run() {
    const {flags} = this.parse(Preview);
    const target = await getTargetOrg(this.configuration, flags.target);
    const options: DryRunOptions = {
      deleteMissingResources: flags.showMissingResources,
    };
    const {reporter, snapshot, project} = await dryRun(
      target,
      this.projectPath,
      options
    );

    await snapshot.preview(project.resourcesPath);

    if (reporter.isSuccessReport()) {
      await snapshot.delete();
    } else {
      await this.handleReportWithErrors(snapshot);
    }

    project.deleteTemporaryZipFile();
  }

  private async handleReportWithErrors(snapshot: Snapshot) {
    // TODO: CDX-362: handle invalid snapshot cases
    const cfg = await this.configuration.get();

    if (snapshot.requiresSynchronization()) {
      displaySnapshotSynchronizationWarning(snapshot, cfg);
      return;
    }

    displayInvalidSnapshotError(snapshot, cfg, this.projectPath);
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  private get projectPath() {
    return cwd();
  }
}
