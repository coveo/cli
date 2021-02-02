import {Command} from '@oclif/command';
import AuthenticationRequired from '../../lib/decorators/authenticationRequired';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {OrganizationModel} from '@coveord/platform-client';
import {cli} from 'cli-ux';

export default class List extends Command {
  static description = 'List Coveo organizations.';

  static flags = {
    ...cli.table.flags(),
  };

  @AuthenticationRequired()
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
  }
}
