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
import type {HostedPage, New} from '@coveo/platform-client';
import type PlatformClient from '@coveo/platform-client';
import {createSearchPagesPrivilege} from '@coveo/cli-commons/preconditions/platformPrivilege';
import {Flags} from '@oclif/core';
import {readJsonSync, ensureDirSync, readFileSync} from 'fs-extra';
import {DeployConfigError} from '../../lib/errors/deployErrors';
import {join} from 'path';
import {Example} from '@oclif/core/lib/interfaces';
import {confirm, startSpinner, stopSpinner} from '@coveo/cli-commons/utils/ux';
import {getTargetOrg} from '../../lib/utils/platform';
import {Config} from '@coveo/cli-commons/config/config';
import {organization} from '../../lib/flags/platformCommonFlags';
import dedent from 'ts-dedent';

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
  schemaVersion: string;
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
  required: ['name', 'dir', 'htmlEntryFile', 'schemaVersion'],
  properties: {
    name: {type: 'string'},
    dir: {type: 'string'},
    htmlEntryFile: FileInputSchema,
    javascriptEntryFiles: {type: 'array', items: JavaScriptFileInputSchema},
    javascriptUrls: {type: 'array', items: JavaScriptFileInputSchema},
    cssEntryFiles: {type: 'array', items: FileInputSchema},
    cssUrls: {type: 'array', items: FileInputSchema},
    schemaVersion: {type: 'string'},
  },
};

export default class Deploy extends CLICommand {
  public static summary =
    'Deploy your search application to the Coveo infrastructure.';

  public static description = `The target "config" must contain the following parameters:
  {
    "name": "The name of the hosted search page.",
    "dir": "The directory of the hosted search page.",
    "htmlEntryFile": {
      "path": "The path to an HTML file containing the HTML markup of the hosted page."
    },
    "javascriptEntryFiles": [
      {
        "path": "The path to a bundled Javascript file.",
        "isModule": "Whether the inline code should be treated as a JavaScript module. If this property is true, the type property will be set to "module" on the script tag."
      }
    ],
    "javascriptUrls": [
      {
        "path": "The URL of the JavaScript source file.",
        "isModule": "Whether the inline code should be treated as a JavaScript module. If this property is true, the type property will be set to "module" on the script tag."
      }
    ],
    "cssEntryFiles": [
      {
        "path": "The path to a bundled CSS file."
      }
    ],
    "cssUrls": [
      {
        "path": "The URL of the CSS stylesheet."
      }
    ]
  }`;

  public static aliases: string[] = ['atomic:deploy'];

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
    ...organization(
      'The unique identifier of the organization where to deploy the hosted page.'
    ),
  };

  public static examples: Example[] = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description:
        'Create a new Hosted Page according to the configuration in the file "coveo.deploy.json"',
    },
    {
      command:
        '<%= config.bin %> <%= command.id %> -p 7944ff4a-9943-4999-a3f6-3e81a7f6fb0a',
      description:
        'Update the Hosted Page whose ID is "7944ff4a-9943-4999-a3f6-3e81a7f6fb0a" according to the configuration in the file "coveo.deploy.json"',
    },
    {
      command: '<%= config.bin %> <%= command.id %> -c ./configs/myconfig.json',
      description:
        'Create a new Hosted Page according to the configuration in the file located at "./configs/myconfig.json"',
    },
  ];

  private flags!: {organization?: string; pageId?: string; config: string};
  private organization!: string;
  private platformClient!: PlatformClient;
  private hostedPage!: New<HostedPage>;
  private pageId: string | undefined;

  @Trackable()
  @Preconditions(
    IsAuthenticated([AuthenticationType.OAuth, AuthenticationType.ApiKey]),
    HasNecessaryCoveoPrivileges(createSearchPagesPrivilege)
  )
  public async run() {
    await this.computeFlags();
    this.computeOrgId();
    await this.instantiatePlatformClient();
    this.computeHostedPage();
    await this.computePageId();

    if (this.pageId) {
      await this.updatePage({...this.hostedPage, id: this.pageId});
    } else {
      await this.createPage(this.hostedPage);
    }
  }

  private async computeFlags() {
    this.flags = (await this.parse(Deploy)).flags;
  }

  private computeOrgId() {
    this.organization = getTargetOrg(
      this.configuration,
      this.flags.organization
    );
  }

  private async instantiatePlatformClient() {
    this.platformClient = await new AuthenticatedClient().getClient({
      organization: this.organization,
    });
  }

  private computeHostedPage() {
    const deployConfigPath = this.flags.config;
    const deployConfig: DeployConfig =
      readJsonSync(deployConfigPath, {throws: false}) || {};
    this.validateDeployConfigJson(deployConfigPath, deployConfig);
    this.hostedPage = this.buildHostedPage(deployConfig);
  }

  private async computePageId() {
    this.pageId = this.getPageIdFromFlags();

    if (this.pageId) {
      return;
    }

    this.pageId = await this.getPageIdFromHostedPage();

    if (this.pageId) {
      await this.confirmOverwrite();
    }
  }

  private getPageIdFromFlags(): string | undefined {
    return this.flags.pageId;
  }

  private async getPageIdFromHostedPage(): Promise<string | undefined> {
    const response = await this.platformClient.hostedPages.list({
      filter: this.hostedPage.name,
    });
    return response.items.find((page) => page.name === this.hostedPage.name)
      ?.id;
  }

  private async confirmOverwrite(): Promise<void | never> {
    if (
      !(await confirm(
        dedent`
      Overwrite page with ID: "${this.pageId}" in organization ${this.organization}? (y/n)`,
        false
      ))
    ) {
      this.error(
        'Page name must be unique, try changing the "name" field in "coveo.deploy.json".'
      );
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

  private async createPage(page: New<HostedPage>) {
    startSpinner(`Creating new Hosted Page named "${page.name}".`);

    const response = await this.platformClient.hostedPages.create(page);
    stopSpinner();
    this.log(
      `To update your page, run "coveo ${this.identifier} -p=${response.id}".`
    );
  }

  private async updatePage(page: HostedPage) {
    startSpinner(`Updating existing Hosted Page with the id "${page.id}".`);

    await this.platformClient.hostedPages.update(page);
    stopSpinner();
  }

  private get configuration() {
    return new Config(this.config.configDir);
  }
}
