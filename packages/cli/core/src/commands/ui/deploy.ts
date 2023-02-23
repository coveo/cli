import {validate, Schema} from 'jsonschema';
import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {
  AuthenticationType,
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
  Preconditions,
} from '@coveo/cli-commons/preconditions/index';
import {HostedPage, New} from '@coveo/platform-client';
import {createSearchPagesPrivilege} from '@coveo/cli-commons/preconditions/platformPrivilege';
import {Flags} from '@oclif/core';
import {readJsonSync, ensureDirSync, readFileSync} from 'fs-extra';
import {DeployConfigError} from '../../lib/errors/deployErrors';
import {join} from 'path';
import {Example} from '@oclif/core/lib/interfaces';
import {startSpinner, stopSpinner} from '@coveo/cli-commons/utils/ux';

interface FileInput {
  path: string;
}

interface JavaScriptFileInput extends FileInput {
  isModule: boolean;
}

export interface DeployConfig {
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
      description: 'The existing ID of the target Hosted search page.',
      helpValue: '7944ff4a-9943-4999-a3f6-3e81a7f6fb0a',
      required: false,
    }),
    config: Flags.string({
      char: 'c',
      description: 'The path to the deployment JSON configuration.',
      helpValue: 'coveo.deploy.json',
      default: 'coveo.deploy.json',
      required: false,
    }),
    organization: Flags.string({
      char: 'o',
      helpValue: 'targetorganizationg7dg3gd',
      required: false,
      description:
        'The unique identifier of the organization where to deploy the hosted page. If not specified, the organization you are connected to will be used.',
    }),
  };
  public static examples: Example[] = [
    {
      command: 'coveo ui:deploy',
      description:
        'Create a new Hosted Page according to the configuration in the file "coveo.deploy.json"',
    },
    {
      command: 'coveo ui:deploy -p 7944ff4a-9943-4999-a3f6-3e81a7f6fb0a',
      description:
        'Update the Hosted Page whose ID is "7944ff4a-9943-4999-a3f6-3e81a7f6fb0a" according to the configuration in the file "coveo.deploy.json"',
    },
    {
      command: 'coveo ui:deploy -c ./configs/myconfig.json',
      description:
        'Create a new Hosted Page according to the configuration in the file located at "./configs/myconfig.json"',
    },
  ];

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

    await this.createPage(hostedPage);
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
          url: path,
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
    startSpinner(`Creating new Hosted Page named "${page.name}".`);

    const client = await this.createClient();
    const response = await client.hostedPages.create(page);
    this.log(`Hosted Page creation successful with id "${response.id}".`);
    stopSpinner();
  }

  private async updatePage(page: HostedPage) {
    startSpinner(`Updating existing Hosted Page with the id "${page.id}".`);

    const client = await this.createClient();
    const response = await client.hostedPages.update(page);
    this.log(`Hosted Page update successful with id "${response.id}".`);
    stopSpinner();
  }
}
