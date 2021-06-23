import {cli} from 'cli-ux';
import {flags} from '@oclif/command';
import {ReadStream} from 'fs';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {Snapshot} from '../../../lib/snapshot/snapshot';
import {red, green, bold} from 'chalk';
import SnapshotBase from './orgConfigBase';

export interface CustomFile extends ReadStream {
  type?: string;
}

export default class Push extends SnapshotBase {
  public static description =
    'Preview, validate and deploy your changes to the destination org';

  public static flags = {
    ...SnapshotBase.flags,
    skipPreview: flags.boolean({
      char: 's',
      description:
        'Do not preview changes before applying them to the organization',
      default: false,
      required: false,
    }),
  };

  public static hidden = true;

  @Preconditions(IsAuthenticated())
  public async run() {
    const {flags} = this.parse(Push);
    const {isValid, snapshot, project} = await this.dryRun();

    if (!flags.skipPreview) {
      await snapshot.preview();
    }

    if (isValid) {
      await this.handleValidReport(snapshot);
      await snapshot.delete();
    }

    project.deleteTemporaryZipFile();
  }

  private async handleValidReport(snapshot: Snapshot) {
    if (!snapshot.hasChangedResources()) {
      return;
    }
    const {flags} = this.parse(Push);
    const canBeApplied = flags.skipPreview || (await this.askForConfirmation());

    if (canBeApplied) {
      await this.applySnapshot(snapshot);
    }
  }

  private async askForConfirmation() {
    const targetOrg = await this.getTargetOrg();
    const canBeApplied = await cli.confirm(
      `\nWould you like to apply these changes to the org ${bold(
        targetOrg
      )}? (y/n)`
    );
    return canBeApplied;
  }

  private async applySnapshot(snapshot: Snapshot) {
    cli.action.start('Applying snapshot');
    const {flags} = this.parse(Push);
    const {isValid} = await snapshot.apply(flags.deleteMissingResources);

    if (!isValid) {
      await this.handleReportWithErrors(snapshot);
    }

    cli.action.stop(isValid ? green('✔') : red.bold('!'));
  }
}
