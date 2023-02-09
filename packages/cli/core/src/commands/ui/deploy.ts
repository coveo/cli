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
import {readFileSync} from 'fs';

export interface FileInput {
  path: string;
}

export interface JavaScriptFileInput extends FileInput {
  isModule: boolean;
}

export interface DeployConfig {
  dir?: string;
  javascriptEntryFiles: JavaScriptFileInput[];
  javascriptUrls: JavaScriptFileInput[];
  cssEntryFiles: FileInput[];
  cssUrls: FileInput[];
}

export default class Deploy extends CLICommand {
  public static flags = {
    pageId: Flags.string({
      char: 'p',
      description: 'The existing ID of the Hosted Page to be updated.',
      helpValue: '7944ff4a-9943-4999-a3f6-3e81a7f6fb0a',
      required: false,
    }),
    config: Flags.string({
      char: 'c',
      description: 'The path to the deploy JSON configuration.',
      helpValue: 'coveo.deploy.json',
      default: 'coveo.deploy.json',
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
    const deployConfig = this.getDeployConfig(flags.config);
    const hostedPage = this.buildHostedPage(deployConfig);

    if (flags.pageId) {
      this.updatePage({...hostedPage, id: flags.pageId});
      return;
    }

    return this.createPage(hostedPage);
  }

  private getDeployConfig(path: string) {
    const jsonConfig: DeployConfig = JSON.parse(
      readFileSync(path, {encoding: 'utf-8'})
    );

    // TODO: validate content using Bueno or similar

    return jsonConfig;
  }

  private buildHostedPage(deployConfig: DeployConfig) {
    // TODO: read file contents, build object

    return {} as HostedPage; // TODO: remove
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
    this.log('Hosted Page creation successful.');
  }

  private async updatePage(page: HostedPage) {
    this.log(`Updating existing Hosted Page with the id "${page.id}".`);

    // const client = await this.createClient();
    // const response = await client.hostedPages.update(page);
    this.log('Hosted Page update successful.');
  }
}
