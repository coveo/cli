import {Command, Flags} from '@oclif/core';
import {spawnSync} from 'child_process';
import {readdirSync, cpSync, existsSync, readFileSync, writeFileSync} from 'fs';
import {dirname, join, relative, resolve} from 'path';
import {cwd} from 'process';
import {fileURLToPath, pathToFileURL} from 'url';
import {appendCmdIfWindows} from '../../lib/utils/os';
import {Project} from '../../lib/project/project';
import {readJsonSync, writeJsonSync} from 'fs-extra';
import detectIndent from 'detect-indent';
export default class ConnectorNew extends Command {
  public static description = 'Generate a new connector project';

  public static examples = ['$ coveo connector:new connectorName'];

  public static args = [
    {
      name: 'name',
      helpValue: 'my-connector-name',
      description: 'The name of the connector to create.',
      required: true,
    },
  ];
  private static readonly DefaultNpmProjectName =
    'MyAwesomeCoveoProjectWOWOWOWOWOW';
  private projectDirectory: string = cwd();
  static TemplatePath: string = dirname(
    require.resolve('baguette-connector-template')
  );
  private project!: Project;
  public async run(): Promise<void> {
    const {args, flags} = await this.parse(ConnectorNew);
    if (!this.isNpmProject()) {
      this.initProject();
    }
    await this.npmCreateConnectorWorkspace();
    await this.npmInstallConnectorDependencies();
    // this.copyBasicFile();
  }
  private initProject() {
    if (!this.isCwdEmpty()) {
      this.projectDirectory = join(
        this.projectDirectory,
        ConnectorNew.DefaultNpmProjectName
      );
    }
    npm(['init', '-y'], this.projectDirectory);
    this.project = new Project(this.projectDirectory);
  }
  //#region npm
  private isNpmProject() {
    const npmRoot = npm(['root']).stdout.trim();
    return relative(npmRoot, cwd()) === '';
  }

  private async npmCreateConnectorWorkspace() {
    if (existsSync(await this.getConnectorPath())) {
      throw 'Connector already existing';
    }
    npm(
      ['init', '-y', '-w', await this.getConnectorSubpath()],
      this.projectDirectory
    );
  }

  private async npmInstallConnectorDependencies() {
    const connectorPackagePath = join(
      await this.getConnectorPath(),
      'package.json'
    );
    const packageJson = readFileSync(connectorPackagePath, 'utf-8');

    const packageTemplate = readFileSync(
      join(ConnectorNew.TemplatePath, 'package.json'),
      'utf-8'
    );

    const pkgIndent = detectIndent(packageTemplate).indent || '\t';
    const finalPackageJsonTemplate = JSON.parse(packageJson);
    const packageJsonObject = JSON.parse(packageTemplate);

    finalPackageJsonTemplate.dependencies = packageJsonObject.dependencies;
    finalPackageJsonTemplate.devDependencies =
      packageJsonObject.devDependencies;

    writeFileSync(
      connectorPackagePath,
      JSON.stringify(finalPackageJsonTemplate, undefined, pkgIndent)
    );
    npm(['install'], this.projectDirectory);
  }
  //#endregion
  //#region utils
  private async getConnectorPath(): Promise<string> {
    return join(this.project.connectorsPath, await this.getConnectorName());
  }

  private async getConnectorSubpath(): Promise<string> {
    return `connectors/${await this.getConnectorName()}`;
  }

  private async getConnectorName() {
    return (await this.parse(ConnectorNew)).args.name;
  }

  private async copyBasicFile() {
    cpSync(
      fileURLToPath([ConnectorNew.TemplatePath, 'src'].join('/')),
      fileURLToPath([await this.getConnectorPath(), 'src'].join('/')),
      {
        recursive: true,
        filter: (src) => src.split('/').pop() !== 'package.json',
      }
    );
  }

  private isCwdEmpty() {
    return readdirSync(cwd()).length === 0;
  }
  //#endregion
}

function npm(args: string[], path: string = cwd()) {
  return spawnSync(appendCmdIfWindows`npm`, args, {
    cwd: path,
    encoding: 'utf-8',
  });
}
