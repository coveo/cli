import {Command, CliUx} from '@oclif/core';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {
  Preconditions,
  IsAuthenticated,
} from '@coveo/cli-commons/preconditions/';

import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {recordable} from '../../lib/utils/record';

export default class List extends Command {
  public static description = 'List Coveo organizations.';

  public static flags = {
    ...CliUx.ux.table.flags(),
  };

  @Trackable()
  @Preconditions(IsAuthenticated())
  public async run() {
    const {flags} = await this.parse(List);
    const orgs = await new AuthenticatedClient().getAllOrgsUserHasAccessTo();
    if (orgs.length === 0) {
      this.log(
        'You do not have access to any organization. Make sure you are logged in the correct environment and region, with coveo auth:login'
      );
    } else {
      CliUx.ux.table(
        recordable(orgs),
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
  public async catch(err?: Error & {exitCode?: number}) {
    throw err;
  }
}
