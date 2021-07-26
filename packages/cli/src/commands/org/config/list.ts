import {Command, flags} from '@oclif/command';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {getTargetOrg} from '../../../lib/snapshot/snapshotCommon';
import {Config} from '../../../lib/config/config';
import {cli} from 'cli-ux';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';
import dedent from 'ts-dedent';

export default class List extends Command {
  public static description = 'List available snapshots from an organization';

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

  public static hidden = true;

  @Preconditions(IsAuthenticated())
  public async run() {
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

    this.config.runHook('analytics', buildAnalyticsSuccessHook(this, flags));
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  public async catch(err?: Error) {
    const {flags} = this.parse(List);
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
  }
}
