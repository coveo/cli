import {validate, Schema} from 'jsonschema';
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
import {readJsonSync, ensureDirSync, readFileSync} from 'fs-extra';
import {DeployConfigError} from '../../lib/errors/deployErrors';
import {join} from 'path';

interface FileInput {
  path: string;
}

interface JavaScriptFileInput extends FileInput {
  isModule: boolean;
}

interface DeployConfig {
  name: string;
  dir: string;
  htmlEntryFile: FileInput;
  javascriptEntryFiles?: JavaScriptFileInput[];
  javascriptUrls?: JavaScriptFileInput[];
  cssEntryFiles?: FileInput[];
  cssUrls?: FileInput[];
}

const FileInputSchema: Schema = {
  type: 'object',
  required: ['path'],
  properties: {
    path: {type: 'string'},
  },
};

const JavaScriptFileInputSchema: Schema = {
  type: 'object',
  required: ['path', 'isModule'],
  properties: {
    path: {type: 'string'},
    patisModuleh: {type: 'boolean'},
  },
};

const DeployConfigSchema: Schema = {
  type: 'object',
  required: ['name', 'dir', 'htmlEntryFile'],
  properties: {
    name: {type: 'string'},
    dir: {type: 'string'},
    htmlEntryFile: FileInputSchema,
    javascriptEntryFiles: {type: 'array', items: JavaScriptFileInputSchema},
    javascriptUrls: {type: 'array', items: JavaScriptFileInputSchema},
    cssEntryFiles: {type: 'array', items: FileInputSchema},
    cssUrls: {type: 'array', items: FileInputSchema},
  },
};

export default class Deploy extends CLICommand {
  public static hidden = true; /* TODO: uncomment */
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
    const deployConfigPath = flags.config;
    const deployConfig: DeployConfig =
      readJsonSync(deployConfigPath, {throws: false}) || {};
    this.validateDeployConfigJson(deployConfigPath, deployConfig);
    const hostedPage = this.buildHostedPage(deployConfig);

    if (flags.pageId) {
      this.updatePage({...hostedPage, id: flags.pageId});
      return;
    }

    try {
      await this.createPage(hostedPage);
    } catch (error) {
      /**
       * TODO: handle Platform Client 400 error e.g.:
       * {
       *  statusCode: 400,
       *  message: "A configuration named 'my page' already exist.",
       *  type: 'DuplicateConfigurationException'
       * }
       */
      console.error(error);
      super.catch(error);
    }
  }

  private validateDeployConfigJson(
    deployConfigPath: string,
    config: DeployConfig
  ) {
    const validation = validate(config, DeployConfigSchema);
    if (!validation.valid) {
      throw new DeployConfigError(deployConfigPath, validation.errors);
    }
  }

  private buildHostedPage({
    dir,
    htmlEntryFile,
    name,
    cssEntryFiles = [],
    cssUrls = [],
    javascriptEntryFiles = [],
    javascriptUrls = [],
  }: DeployConfig): New<HostedPage> {
    ensureDirSync(dir);

    return {
      name,
      html: readFileSync(join(dir, htmlEntryFile.path), 'utf-8'),
      javascript: [
        ...javascriptEntryFiles.map(({path, isModule}) => ({
          inlineContent: readFileSync(join(dir, path), 'utf-8'),
          isModule,
        })),
        ...javascriptUrls.map(({path, isModule}) => ({
          inlineContent: path,
          isModule,
        })),
      ],
      css: [
        ...cssEntryFiles.map(({path}) => ({
          inlineContent: readFileSync(join(dir, path), 'utf-8'),
        })),
        ...cssUrls.map(({path}) => ({
          url: path,
        })),
      ],
    };
  }

  private async createClient() {
    const authenticatedClient = new AuthenticatedClient();
    return await authenticatedClient.getClient();
  }

  private async createPage(page: New<HostedPage>) {
    this.log(`Creating new Hosted Page named "${page.name}".`);

    const client = await this.createClient();
    const response = await client.hostedPages.create(page);
    this.log(`Hosted Page creation successful with id "${response.id}".`);
  }

  private async updatePage(page: HostedPage) {
    this.log(`Updating existing Hosted Page with the id "${page.id}".`);

    const client = await this.createClient();
    const response = await client.hostedPages.update(page);
    this.log(`Hosted Page update successful with id "${response.id}".`);
  }
}
