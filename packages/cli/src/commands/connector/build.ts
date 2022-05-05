import ts from 'typescript';
import * as TJS from 'typescript-json-schema';
import {Command, Flags} from '@oclif/core';
import {Project} from '../../lib/project/project';
import {cwd} from 'process';
import {join, resolve} from 'path';
import {readdirSync} from 'fs';

export default class ConnectorBuild extends Command {
  static description = 'describe the command here';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {
    // flag with a value (-n, --name=VALUE)
    baseUrl: Flags.string({char: 'b', description: 'yadayada'}),
    connector: Flags.string({
      name: 'connector',
      char: 'c',
      required: false,
    }),
  };

  private files!: string[];
  private program!: ts.Program;
  private typeChecker!: any;
  private schemaGenerator!: TJS.JsonSchemaGenerator;
  private project!: Project;
  private connectorPath!: string;

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(ConnectorBuild);

    this.project = new Project(cwd());
    this.connectorPath = this.getConnectorPath(args, flags);

    this.files = this.getFiles();
    this.initializeAstUtils();
    for (const file of this.files) {
      this.computeDataTypes(file);
    }
  }

  private getFiles(): any {
    const dataTypeTopDir = join(this.connectorPath, 'dataTypes');
    const dataTypeDirectories = readdirSync(dataTypeTopDir);
    return dataTypeDirectories.map((dir) =>
      join(dataTypeTopDir, dir, 'index.ts')
    );
  }

  private initializeAstUtils() {
    this.program = ts.createProgram(this.files, {});
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

    const CONNECTOR_SDK_IDENTIFIER = '"@coveo/connector-sdk"';
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

    for (const FkInterface of Arguments) {
      console.log(FkInterface.getText());
      console.log(
        this.schemaGenerator.getSchemaForSymbol(FkInterface.getText())
      );
    }
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
