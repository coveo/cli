import {Command} from '@oclif/command';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {OrganizationModel} from '@coveord/platform-client';
import {cli} from 'cli-ux';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../hooks/analytics/analytics';
import {
  Preconditions,
  IsAuthenticated,
} from '../../lib/decorators/preconditions/';

export default class List extends Command {
  static description = 'List Coveo organizations.';

  static flags = {
    ...cli.table.flags(),
  };

  @Preconditions(IsAuthenticated())
  async run() {
    const {flags} = this.parse(List);
    const orgs = ((await (
      await new AuthenticatedClient().getClient()
    ).organization.list()) as unknown) as OrganizationModel[];
    cli.table(
      orgs,
      {
        id: {},
        type: {},
        displayName: {
          extended: true,
        },
        createdDate: {
          get: (row) => row.createdDate && new Date(row.createdDate),
          extended: true,
        },
        owner: {
          get: (r) => r.owner.email,
          extended: true,
        },
      },
      {...flags}
    );

    await this.config.runHook(
      'analytics',
      buildAnalyticsSuccessHook(this, flags)
    );
  }

  async catch(err?: Error) {
    const {flags} = this.parse(List);
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
    throw err;
  }
}
