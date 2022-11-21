import {
  createWriteStream,
  existsSync,
  unlinkSync,
  writeFileSync,
  rmSync,
} from 'fs';
import {join} from 'path';
import {CliUx} from '@oclif/core';
import archiver from 'archiver';
import {InvalidProjectError} from '../errors.js';
import extract from 'extract-zip';
import {DotFolder, DotFolderConfig} from './dotFolder.js';
import {readJsonSync, writeJsonSync, WriteOptions} from 'fs-extra';
import {ResourceSnapshotType} from '@coveo/platform-client';
import {fileDepthSearch} from '../utils/file.js';

interface ResourceManifest {
  orgId?: string;
}
export class Project {
  public static readonly resourceFolderName = 'resources';
  public static readonly jsonFormat: WriteOptions = {spaces: '\t'};
  public constructor(private _pathToProject: string, orgId?: string) {
    if (!this.isCoveoProject) {
      this.makeCoveoProject(orgId);
    }
  }

  public async refresh(projectContent: Blob) {
    const buffer = await projectContent.arrayBuffer();
    const view = new DataView(buffer);
    writeFileSync(this.temporaryZipPath, view);
    await extract(this.temporaryZipPath, {dir: this.resourcePath});
    this.formatResourceFiles();
    this.deleteTemporaryZipFile();
  }

  public reset() {
    if (this.isResourcesProject) {
      rmSync(Project.resourceFolderName, {recursive: true, force: true});
    }
  }

  private formatResourceFiles(dirPath = this.resourcePath) {
    for (const filePath of fileDepthSearch(dirPath)) {
      const content = readJsonSync(filePath);
      writeJsonSync(filePath, content, Project.jsonFormat);
    }
  }

  public deleteTemporaryZipFile() {
    if (existsSync(this.temporaryZipPath)) {
      unlinkSync(this.temporaryZipPath);
    }
  }

  private ensureProjectCompliance() {
    if (!this.isResourcesProject) {
      throw new InvalidProjectError(
        this._pathToProject,
        'Does not contain any resources folder'
      );
    }
    if (!this.isCoveoProject) {
      throw new InvalidProjectError(
        this._pathToProject,
        'Does not contain any .coveo folder'
      );
    }
  }

  public async compressResources() {
    let cachedManifest;
    try {
      this.ensureProjectCompliance();
      cachedManifest = readJsonSync(this.resourceManifestPath, {
        throws: false,
      });
      rmSync(this.resourceManifestPath, {force: true});
      await new Promise<void>((resolve, reject) => {
        const outputStream = createWriteStream(this.temporaryZipPath);
        const archive = archiver('zip');

        outputStream.on('close', () => resolve());
        archive.on('error', (err) => reject(err));

        archive.pipe(outputStream);
        archive.directory(this.resourcePath, false);
        archive.finalize();
      });
      if (cachedManifest) {
        writeJsonSync(this.resourceManifestPath, cachedManifest);
      }
      return this.temporaryZipPath;
    } catch (error) {
      if (cachedManifest) {
        writeJsonSync(this.resourceManifestPath, cachedManifest);
      }
      CliUx.ux.error(error as string | Error);
    }
  }

  public writeResourcesManifest(orgId: string) {
    try {
      const manifestJson =
        readJsonSync(this.resourceManifestPath, {throws: false}) ?? {};
      writeJsonSync(this.resourceManifestPath, {...manifestJson, orgId});
    } catch (e: unknown) {
      // noop
    }
  }

  public getResourceManifest(): ResourceManifest | null {
    return readJsonSync(this.resourceManifestPath, {throws: false});
  }

  public get resourceTypes(): ResourceSnapshotType[] {
    this.ensureProjectCompliance();
    const resourceTypes: ResourceSnapshotType[] = [];
    const filePaths = fileDepthSearch(this.resourcePath);

    for (const filePath of filePaths) {
      const {resources} = readJsonSync(filePath) || {};
      if (resources) {
        const keys = Object.keys(resources) as ResourceSnapshotType[];
        resourceTypes.push(...keys);
      }
    }

    return resourceTypes;
  }

  public get pathToProject() {
    return this._pathToProject;
  }

  private get temporaryZipPath() {
    return join(this._pathToProject, 'snapshot.zip');
  }

  private get resourceManifestPath() {
    return join(this.resourcePath, 'manifest.json');
  }

  public get resourcePath() {
    return join(this._pathToProject, Project.resourceFolderName);
  }

  public contains(fileName: string) {
    return existsSync(join(this.pathToProject, fileName));
  }

  private get isCoveoProject() {
    return this.contains(DotFolder.hiddenFolderName);
  }

  private get isResourcesProject() {
    return this.contains(Project.resourceFolderName);
  }

  private makeCoveoProject(orgId?: string) {
    const dotFolder = new DotFolder(this.pathToProject);
    new DotFolderConfig(dotFolder, orgId);
  }
}
