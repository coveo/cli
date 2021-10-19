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

export enum publicTemplates {
  Developer = 'developer',
}

export default class Create extends Command {
  public static description = 'Create a Coveo organization.';

  public static flags = {
    template: flags.string({
      hidden: true,
      char: 't',
      helpValue: 'TODO:',
      options: Object.keys(publicTemplates),
      default: publicTemplates.Developer,
      description: 'The name of the template to base the new organization on.',
    }),
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

  @Preconditions(
    IsAuthenticated()
    //   TODO: check if some platform privilege is required to create an org
  )
  public async run() {
    const {id} = await this.createOrganization();
    this.showFeedback(id);
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
    const {args, flags} = this.parse(Create);
    const client = await new AuthenticatedClient().getClient();
    return client.organization.create({
      creationOrigin: OrganizationCreationOrigin.CLI,
      name: args.name,
      organizationTemplate: flags.template,
    });
  }

  private showFeedback(orgId: string) {
    const {flags} = this.parse(Create);
    if (flags.setDefaultOrganization) {
      this.configuration.set('organization', orgId);
      cli.log(`Organization ${orgId} created and set as default`);
    } else {
      cli.log(`Organization ${orgId} created`);
    }
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }
}
