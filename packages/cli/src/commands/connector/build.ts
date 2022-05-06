import ts from 'typescript';
import * as TJS from 'typescript-json-schema';
import {Command, Flags} from '@oclif/core';
import {Project} from '../../lib/project/project';
import {cwd} from 'process';
import {join, parse} from 'path';
import {readdirSync} from 'fs';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {
  IsAuthenticated,
  Preconditions,
} from '../../lib/decorators/preconditions';

export default class ConnectorBuild extends Command {
  static description = 'describe the command here';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {
    baseUrl: Flags.string({char: 'b', description: 'yadayada', required: true}),
    connector: Flags.string({
      name: 'connector',
      char: 'c',
      required: false,
    }),
    tsConfigPath: Flags.string({
      char: 't',
      required: false,
    }),
  };

  private files!: string[];
  private program!: ts.Program;
  private typeChecker!: any;
  private schemaGenerator!: TJS.JsonSchemaGenerator;
  private project!: Project;
  private connectorPath!: string;

  @Preconditions(IsAuthenticated())
  public async run(): Promise<void> {
    const {args, flags} = await this.parse(ConnectorBuild);

    this.project = new Project(cwd());
    this.connectorPath = this.getConnectorPath(args, flags);

    this.files = this.getFiles();
    const tsConfig = flags.tsConfigPath
      ? ts.readConfigFile(flags.tsConfigPath, ts.sys.readFile).config
      : {
          lib: ['lib.esnext.d.ts', 'lib.dom.d.ts'],
        };
    this.initializeAstUtils(tsConfig);

    const TheConfig: any = {
      Url: flags.baseUrl,
    };

    let endpoints = [];
    for (const file of this.files) {
      endpoints.push(this.computeDataTypes(file));
    }
    TheConfig.Endpoints = endpoints;

    const platClient = new AuthenticatedClient().getClient();
    (await platClient).source.create(
      {
        name: parse(this.connectorPath).name,
        logicalIndex: 'default',
        sourceType: 'GENERIC_REST',
        sourceVisibility: 'SHARED',
        restConfiguration: JSON.stringify({Services: [TheConfig]}),
      },
      {rebuild: true}
    );
  }

  private getFiles(): any {
    const dataTypeTopDir = join(this.connectorPath, 'dataTypes');
    const dataTypeDirectories = readdirSync(dataTypeTopDir);
    return dataTypeDirectories.map((dir) =>
      join(dataTypeTopDir, dir, 'index.ts')
    );
  }

  private initializeAstUtils(tsConfig: ts.CompilerOptions) {
    this.program = ts.createProgram(this.files, tsConfig);
    this.typeChecker = this.program.getTypeChecker();
    const generator = TJS.buildGenerator(this.program);
    if (!generator) {
      throw 'TSJ generator init failed ohno';
    }
    this.schemaGenerator = generator;
  }

  public computeDataTypes(sourceFileName: string) {
    const sourceFile = this.program.getSourceFile(sourceFileName);
    if (!sourceFile) {
      throw 'Source file not found, wth';
    }

    const CONNECTOR_SDK_IDENTIFIER = '"baguette-connector-sdk"';
    const CONNECTOR_SDK_CLASS_NAME = 'ItemType';

    const hasHerited =
      (inheritedType: ts.Type) => (classCandidate: ts.ClassLikeDeclaration) => {
        if (!classCandidate.heritageClauses) {
          return [];
        }
        for (const heritage of classCandidate.heritageClauses) {
          for (const type of heritage.types) {
            if (
              this.typeChecker.getTypeAtLocation(type.expression) ===
              inheritedType
            ) {
              return [type];
            }
          }
        }
        return [];
      };

    // Find Node of ItemType from 'connector-sdk'
    const children = sourceFile.getChildren();
    const sourceFileSyntaxList = children.find(
      (child) => child.kind === ts.SyntaxKind.SyntaxList
    );
    if (!sourceFileSyntaxList) {
      throw 'file might be empty, no syntaxList found';
    }
    const sdkImport = sourceFileSyntaxList
      .getChildren()
      .filter(ts.isImportDeclaration)
      .find(
        (importDeclaration) =>
          importDeclaration.moduleSpecifier.getText() ===
          CONNECTOR_SDK_IDENTIFIER
      );

    const importedElements = sdkImport?.importClause?.namedBindings;
    let ItemTypeClassIdentifier;
    if (!importedElements) {
      throw `no import of ${CONNECTOR_SDK_IDENTIFIER} found`;
    }
    if (ts.isNamedImports(importedElements)) {
      ItemTypeClassIdentifier = importedElements.elements.find(
        (element) => element.getText() === CONNECTOR_SDK_CLASS_NAME
      );
    }
    if (!ItemTypeClassIdentifier) {
      throw `no import of ${CONNECTOR_SDK_CLASS_NAME} found`;
    }
    const ItemTypeClassType = this.typeChecker.getTypeAtLocation(
      ItemTypeClassIdentifier
    );

    const classesOfSourceFile = sourceFileSyntaxList
      .getChildren()
      .filter(ts.isClassDeclaration);
    const TheClassesTypes = classesOfSourceFile.flatMap(
      hasHerited(ItemTypeClassType)
    );

    if (TheClassesTypes.length > 1) {
      throw 'Only one ItemType per file';
    }
    const TheClassType = TheClassesTypes[0];

    const Arguments = TheClassType.typeArguments;

    if (!Arguments) {
      throw 'No typeArguments found while extending ItemType. wtf';
    }
    const [parameters, , returnType, manifestType] = Arguments;
    const [parametersSchema, returnTypeSchema, manifestTypeSchema] = [
      parameters,
      returnType,
      manifestType,
    ].map((tsInterface) =>
      this.schemaGenerator.getSchemaForSymbol(tsInterface.getText())
    );

    const queryParameters: Record<string, string> = {};
    for (const [propertyKey, propertyValue] of Object.entries(
      parametersSchema.properties ?? []
    )) {
      const propertyEnum = (propertyValue as any)['enum'] as
        | Array<unknown>
        | undefined;
      if (!propertyEnum) {
        throw 'Args should be fixed value';
      }
      if (propertyEnum.length > 1) {
        throw 'Args should have only one value';
      }
      const typeOfEnumValue = typeof propertyEnum[0];
      switch (typeOfEnumValue) {
        case 'string':
        case 'number':
        case 'boolean':
          break;

        default:
          throw 'Args should be either a string, a number or a boolean';
      }
      queryParameters[propertyKey] = `${propertyEnum[0]}`;
    }

    const customProperties: Record<string, string> = {};
    const config: any = {
      Method: 'GET',
    };
    for (const propertyKey of Object.keys(returnTypeSchema.properties ?? [])) {
      if (minimalMetadataKeys.includes(propertyKey)) {
        config[propertyKey] = `%[${propertyKey}]`;
      } else {
        customProperties[propertyKey] = `%[${propertyKey}]`;
      }
    }

    if (Object.keys(customProperties).length > 0) {
      config['Metadata'] = customProperties;
    }
    if (Object.keys(queryParameters).length > 0) {
      config['QueryParameters'] = queryParameters;
    }

    for (const [propertyKey, propertyValue] of Object.entries(
      manifestTypeSchema.properties ?? []
    )) {
      const propertyEnum = (propertyValue as any)['enum'] as
        | Array<unknown>
        | undefined;
      if (!propertyEnum) {
        throw 'Manifest data should be fixed value';
      }
      if (propertyEnum.length > 1) {
        throw 'Manifest data should have only one value';
      }
      const typeOfEnumValue = typeof propertyEnum[0];
      switch (typeOfEnumValue) {
        case 'string':
          break;

        default:
          throw 'Manifest data should be a string';
      }
      config[propertyKey] = propertyEnum[0];
    }

    console.log(JSON.stringify(config, undefined, 2));
    return config;
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

const minimalMetadataKeys = [
  'ClickableUri',
  'ItemType',
  'Path',
  'Uri',
  'Title',
];
