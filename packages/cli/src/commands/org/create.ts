import {Command, flags} from '@oclif/command';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {cli} from 'cli-ux';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../hooks/analytics/analytics';
import {
  Preconditions,
  IsAuthenticated,
} from '../../lib/decorators/preconditions/';
import {OrganizationCreationOrigin} from '@coveord/platform-client';
import {Config} from '../../lib/config/config';
import {bold} from 'chalk';

export default class Create extends Command {
  public static description = 'Create a new test Coveo organization.';

  public static flags = {
    setDefaultOrganization: flags.boolean({
      char: 'd',
      default: false,
      description: 'Set the newly created organization as the default one',
    }),
  };

  public static args = [
    {
      name: 'name',
      helpValue: 'neworg-prod',
      description: 'The name to assign to the new organization.',
      required: true,
    },
  ];

  @Preconditions(IsAuthenticated())
  public async run() {
    cli.action.start('Creating organization');
    const {id} = await this.createOrganization();
    const endMessage = this.generateEndMessageFromOrgId(id);
    cli.action.stop(endMessage);

    await this.config.runHook(
      'analytics',
      buildAnalyticsSuccessHook(this, flags)
    );
  }

  public async catch(err?: Error) {
    const {flags} = this.parse(Create);
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
    throw err;
  }

  private async createOrganization() {
    const {args} = this.parse(Create);
    const client = await new AuthenticatedClient().getClient();
    return client.organization.create({
      creationOrigin: OrganizationCreationOrigin.CLI,
      name: args.name,
      organizationTemplate: 'Developer',
    });
  }

  private generateEndMessageFromOrgId(orgId: string) {
    const {flags} = this.parse(Create);
    let message = `Organization ${bold.cyan(orgId)} created`;

    if (flags.setDefaultOrganization) {
      this.configuration.set('organization', orgId);
      message += ' and set as default';
    }

    return message;
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }
}
