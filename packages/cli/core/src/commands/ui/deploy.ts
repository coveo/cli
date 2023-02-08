import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {
  AuthenticationType,
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
  Preconditions,
} from '@coveo/cli-commons/preconditions';
import {HostedPage, New} from '@coveo/platform-client';
import {createSearchPagesPrivilege} from '@coveo/cli-commons/preconditions/platformPrivilege';
import {Flags} from '@oclif/core';

export default class Deploy extends CLICommand {
  public static flags = {
    pageId: Flags.string({
      char: 'p',
      description: 'The existing ID of the Hosted Page to be updated.',
      helpValue: '7944ff4a-9943-4999-a3f6-3e81a7f6fb0a',
      required: false,
    }),
  };

  @Trackable()
  @Preconditions(
    IsAuthenticated([AuthenticationType.OAuth]),
    HasNecessaryCoveoPrivileges(createSearchPagesPrivilege)
  )
  public async run() {
    const {flags} = await this.parse(Deploy);

    /**
     * TODO:
     *  1. Read config file & parse
     *  2. Read files defined in config
     *  3. Build HostedPage object
     */
    if (flags.pageId) {
      this.updatePage(
        {name: 'test', id: flags.pageId} as HostedPage /* TODO: update */
      );
      return;
    }

    return this.createPage({name: 'test'} as HostedPage /* TODO: update */);
  }

  // TODO: set private
  async createClient() {
    const authenticatedClient = new AuthenticatedClient();
    return await authenticatedClient.getClient();
  }

  private async createPage(page: New<HostedPage>) {
    this.log(`Creating new Hosted Page named "${page.name}".`);

    // const client = await this.createClient();
    // const response = await client.hostedPages.create(page);
    this.log('Creation successful.');
  }

  private async updatePage(page: HostedPage) {
    this.log(`Updating existing Hosted Page with the id "${page.id}".`);

    // const client = await this.createClient();
    // const response = await client.hostedPages.update(page);
    this.log('Update successful.');
  }
}
