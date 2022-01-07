import {Command, flags} from '@oclif/command';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {getTargetOrg} from '../../../lib/snapshot/snapshotCommon';
import {Config} from '../../../lib/config/config';
import {cli} from 'cli-ux';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import dedent from 'ts-dedent';
import {Trackable} from '../../../lib/decorators/preconditions/trackable';

export default class List extends Command {
  public static description =
    '(beta) List available snapshots from an organization';

  public static flags = {
    ...cli.table.flags(),
    target: flags.string({
      char: 't',
      description:
        'The unique identifier of the organization containing the snapshots. If not specified, the organization you are connected to will be used.',
      helpValue: 'destinationorganizationg7dg3gd',
      required: false,
    }),
  };

  @Trackable()
  @Preconditions(IsAuthenticated())
  public async run() {
    this.warn(
      'The org:resources commands are currently in public beta, please report any issue to github.com/coveo/cli/issues'
    );
    const {flags} = this.parse(List);
    const org = await getTargetOrg(this.configuration, flags.target);
    const platformClient = await new AuthenticatedClient().getClient({
      organization: org,
    });
    const snapshots = await platformClient.resourceSnapshot.list();
    if (snapshots.length === 0) {
      this.log(
        dedent(
          `There is no configuration snapshot available in organization ${org}`
        )
      );
      return;
    }
    cli.table(snapshots, {
      id: {},
      createdBy: {
        header: 'Created by',
      },
      createdDate: {
        get: (row) => row.createdDate && new Date(row.createdDate),
        header: 'Created date',
      },
      targetId: {header: 'Target id'},
      developerNote: {header: 'Developer note'},
    });
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  @Trackable()
  public async catch(err?: Error) {
    throw err;
  }
}
