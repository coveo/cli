import {SourceType, SourceVisibility} from '@coveord/platform-client';
import {PushSource} from '@coveo/push-api-client';
import {Command, Flags} from '@oclif/core';
import {green} from 'chalk';
import dedent from 'ts-dedent';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {Trackable} from '../../../lib/decorators/preconditions/trackable';
import {withSourceVisibility} from '../../../lib/flags/sourceCommonFlags';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';

export default class SourcePushNew extends Command {
  public static description =
    'Create a new push source in a Coveo organization';

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
  @Preconditions(IsAuthenticated())
  public async run() {
    // TODO: CDX-??? use create method from push-api-client
    const {flags, args} = await this.parse(SourcePushNew);
    const authenticatedClient = new AuthenticatedClient();
    const platformClient = await authenticatedClient.getClient();

    const res = await platformClient.source.create({
      sourceType: SourceType.PUSH,
      pushEnabled: true,
      name: args.name,
      sourceVisibility: flags.sourceVisibility,
    });

    this.log(
      green(
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
