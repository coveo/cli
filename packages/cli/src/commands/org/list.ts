import {Command} from '@oclif/command';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {cli} from 'cli-ux';
import {
  Preconditions,
  IsAuthenticated,
} from '../../lib/decorators/preconditions/';
import {Trackable} from '../../lib/decorators/preconditions/trackable';

export default class List extends Command {
  public static description = 'List Coveo organizations.';

  public static flags = {
    ...cli.table.flags(),
  };

  @Trackable()
  @Preconditions(IsAuthenticated())
  public async run() {
    const {flags} = this.parse(List);
    const orgs = await new AuthenticatedClient().getAllOrgsUserHasAccessTo();
    if (orgs.length === 0) {
      this.log(
        'You do not have access to any organization. Make sure you are logged in the correct environment and region, with coveo auth:login'
      );
    } else {
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

  @Trackable()
  public async catch(err?: Error) {
    throw err;
  }
}
