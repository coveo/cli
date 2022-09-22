import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {
  formatOrgId,
  startSpinner,
  stopSpinner,
} from '@coveo/cli-commons/utils/ux';
import {Flags} from '@oclif/core';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {
  Preconditions,
  IsAuthenticated,
} from '@coveo/cli-commons/preconditions/index';
import {OrganizationCreationOrigin} from '@coveord/platform-client';
import {Config} from '@coveo/cli-commons/config/config';
import dedent from 'ts-dedent';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';

export default class Create extends CLICommand {
  public static description = 'Create a new test Coveo organization.';

  public static flags = {
    setDefaultOrganization: Flags.boolean({
      char: 's',
      default: true,
      allowNo: true,
      description: 'Set the created organization as the default one',
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

  @Trackable()
  @Preconditions(IsAuthenticated())
  public async run() {
    startSpinner('Creating organization');
    const {id} = await this.createOrganization();
    const endMessage = await this.generateEndMessageFromOrgId(id);
    stopSpinner();
    this.log(endMessage);
  }

  private async createOrganization() {
    const {args} = await this.parse(Create);
    const client = await new AuthenticatedClient().getClient();
    return client.organization.create({
      creationOrigin: OrganizationCreationOrigin.CLI,
      name: args.name,
      organizationTemplate: 'Developer',
    });
  }

  private async generateEndMessageFromOrgId(orgId: string) {
    const {flags} = await this.parse(Create);
    if (flags.setDefaultOrganization) {
      this.configuration.set('organization', orgId);
    }

    const cfg = this.configuration.get();
    const message = dedent`Organization ${formatOrgId(
      orgId
    )} successfully created.

    You are currently logged into organization ${formatOrgId(
      cfg.organization
    )} and further command will be ran against that organization by default.

    If you wish to switch organization use \`coveo config:set\`.

    To see current configuration use \`coveo config:get\``;

    return message;
  }

  private get configuration() {
    return new Config(this.config.configDir);
  }
}
