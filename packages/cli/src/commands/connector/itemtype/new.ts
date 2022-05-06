import {Command, Flags} from '@oclif/core';
import {cwd} from 'process';
import {Project} from '../../../lib/project/project';
import {ItemTypeClass, RouteFile} from 'baguette-connector-template';
import {mkdirSync, writeFileSync} from 'fs';
import {dirname, join} from 'path';
import {format} from 'prettier';

export default class ItemTypeAdd extends Command {
  public static description =
    'Generate a new itemtype into a connector project';

  public static examples = ['$ coveo connector:new [connectorName] itemtype '];

  public static args = [
    {
      name: 'itemTypeName',
      helpValue: 'my-item-type',
      description: 'The name of the itemtype to create.',
      required: true,
    },
  ];

  public static flags = {
    connector: Flags.string({
      name: 'connector',
      char: 'c',
      required: false,
    }),
  };

  static TemplatePath: string = require.resolve('baguette-connector-template');
  static ItemTypeValidator: RegExp = /[a-zA-Z]+/;
  private project!: Project;
  private connectorPath!: string;

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(ItemTypeAdd);
    if (!Project.isDirectoryACoveoProject(cwd())) {
      throw 'Not a Coveo Project';
    }
    if (!ItemTypeAdd.ItemTypeValidator.test(args.itemTypeName ?? '')) {
      throw 'Invalid/missing itemTypeName';
    }
    this.project = new Project(cwd());
    this.connectorPath = this.getConnectorPath(args, flags);
    this.createItemTypeDataClass(args.itemTypeName);
    this.createItemTypeRoute(args.itemTypeName);
  }

  private createItemTypeRoute(itemTypeName: string) {
    const routeFilePath = join(
      this.connectorPath,
      'netlify',
      'functions',
      itemTypeName,
      'index.ts'
    );
    mkdirSync(dirname(routeFilePath), {recursive: true});
    writeFileSync(
      routeFilePath,
      format(RouteFile(itemTypeName), {parser: 'typescript'})
    );
  }

  private createItemTypeDataClass(itemTypeName: string) {
    const dataTypeFilePath = join(
      this.connectorPath,
      'dataTypes',
      itemTypeName,
      'index.ts'
    );
    mkdirSync(dirname(dataTypeFilePath), {recursive: true});
    writeFileSync(
      dataTypeFilePath,
      format(ItemTypeClass(itemTypeName), {parser: 'typescript'})
    );
  }

  //TODO INNO-1: Refacto
  private getConnectorPath(
    args: {[name: string]: any},
    flags: {connector: string | undefined} & {json: boolean | undefined}
  ) {
    const nbOfConnectors = this.project.numberOfConnectors;
    if (nbOfConnectors === 0) {
      throw 'No connectors in this Coveo Project, create one first';
    }
    let connectorPath = '';
    if (!flags.connector && nbOfConnectors > 1) {
      throw 'You have more than one connector, you need to specify the connector name';
    }

    const candidateConnectorPath = this.project.getConnectorPath(
      flags.connector
    );
    if (!candidateConnectorPath) {
      throw `No connector named ${candidateConnectorPath} existing, create it first`;
    } else {
      connectorPath = candidateConnectorPath;
    }

    return connectorPath;
  }
}
