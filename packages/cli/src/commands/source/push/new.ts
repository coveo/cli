import {SourceType, SourceVisibility} from '@coveord/platform-client';
import {Command, flags} from '@oclif/command';
import {green} from 'chalk';
import dedent from 'ts-dedent';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';

export default class SourcePushNew extends Command {
  public static description =
    'Create a new push source in a Coveo organization';

  public static flags = {
    sourceVisibility: flags.enum({
      options: [
        SourceVisibility.PRIVATE,
        SourceVisibility.SECURED,
        SourceVisibility.SHARED,
      ],
      description:
        'Controls the content security option that should be applied to the items in a source. See https://docs.coveo.com/en/1779/index-content/content-security',
      default: SourceVisibility.SECURED,
      char: 'v',
    }),
  };

  public static args = [
    {
      name: 'name',
      description: 'The name of the source to create.',
      required: true,
    },
  ];

  @Preconditions(IsAuthenticated())
  public async run() {
    const {flags, args} = this.parse(SourcePushNew);

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
    this.config.runHook('analytics', buildAnalyticsSuccessHook(this, flags));
  }

  public async catch(err?: Error) {
    const {flags} = this.parse(SourcePushNew);
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
    throw err;
  }
}
