import {SourceType} from '@coveord/platform-client';
import {Command} from '@oclif/core';
import chalk from 'chalk';
import {dedent} from 'ts-dedent';
import {
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions/index.js';
import {writeSourceContentPrivilege} from '../../../lib/decorators/preconditions/platformPrivilege.js';
import {Trackable} from '../../../lib/decorators/preconditions/trackable.js';
import {withSourceVisibility} from '../../../lib/flags/sourceCommonFlags.js';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient.js';

export default class SourceCataloghNew extends Command {
  public static description =
    'Create a new catalog source in a Coveo organization';

  public static flags = {
    ...withSourceVisibility(),
  };

  public static args = [
    {
      name: 'name',
      description: 'The name of the source to create.',
      required: true,
    },
  ];

  @Trackable()
  @Preconditions(
    IsAuthenticated(),
    HasNecessaryCoveoPrivileges(writeSourceContentPrivilege)
  )
  public async run() {
    const {flags, args} = await this.parse(SourceCataloghNew);
    const authenticatedClient = new AuthenticatedClient();
    const platformClient = await authenticatedClient.getClient();

    const res = await platformClient.source.create({
      sourceType: SourceType.CATALOG,
      pushEnabled: true,
      streamEnabled: true,
      name: args.name,
      sourceVisibility: flags.sourceVisibility,
    });

    this.log(
      chalk.green(
        dedent(
          `Source ${args.name} with visibility ${flags.sourceVisibility} has been successfully created.
        Id: ${res.id}`
        )
      )
    );
  }

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    throw err;
  }
}
