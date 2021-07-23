import {
  ResourceSnapshotsReportModel,
  ResourceSnapshotType,
} from '@coveord/platform-client';
import {existsSync, mkdirSync, readdirSync, rmSync} from 'fs';
import {readJSONSync, writeJSONSync} from 'fs-extra';
import {join, resolve} from 'path';
import {cli} from 'cli-ux';
import {Project} from '../project/project';
import {spawnProcess} from '../utils/process';
import {SnapshotFactory} from './snapshotFactory';
import dedent from 'ts-dedent';
import {Dirent} from 'fs';

type ResourcesJSON = Object & {resourceName: string};

type SnapshotFileJSON = Object & {
  resources: Partial<{[key in ResourceSnapshotType]: ResourcesJSON[]}>;
};

export class ExpandedPreviewer {
  private static readonly previewDirectory: string = '.coveo/preview';

  private resourcesToPreview: ResourceSnapshotType[];
  private static previewHistorySize = 5;

  public constructor(
    report: ResourceSnapshotsReportModel,
    private readonly orgId: string,
    private readonly previewedSnapshotDirPath: string,
    private readonly shouldDelete: boolean
  ) {
    this.resourcesToPreview = Object.keys(
      report.resourceOperationResults
    ) as ResourceSnapshotType[];
  }

  /**
   * preview
   */
  public async preview() {
    this.deleteOldestPreviews();
    if (Date.now() > 0) return;
    const previewLocalSlug = `${this.orgId}-${Date.now()}`;
    const dirPath = resolve(
      join(ExpandedPreviewer.previewDirectory, previewLocalSlug)
    );
    mkdirSync(dirPath, {
      recursive: true,
    });
    const project = new Project(dirPath);
    await this.initPreviewDirectory(project);
    await this.applySnapshotToPreview(dirPath);
    cli.info(dedent`
    
    A Git repository representing the modification has been created here:
    ${dirPath}
    
    `);
  }

  private deleteOldestPreviews() {
    const getFilePath = (fileDirent: Dirent) =>
      join(ExpandedPreviewer.previewDirectory, fileDirent.name);

    const getEpochFromSnapshotDir = (dir: Dirent): number =>
      parseInt(dir.name.match(/(?<=-)\d+$/)?.[0] ?? '0');

    const allFiles = readdirSync(ExpandedPreviewer.previewDirectory, {
      withFileTypes: true,
    });
    const dirs = allFiles
      .filter((potentialDir) => potentialDir.isDirectory())
      .sort(
        (dirA, dirB) =>
          getEpochFromSnapshotDir(dirA) - getEpochFromSnapshotDir(dirB)
      );

    while (dirs.length >= ExpandedPreviewer.previewHistorySize) {
      rmSync(getFilePath(dirs.shift()!), {
        recursive: true,
        force: true,
      });
    }
  }

  private async initPreviewDirectory(project: Project) {
    const beforeSnapshot = await this.getBeforeSnapshot();
    await project.refresh(beforeSnapshot);
    await this.initialPreviewCommit(project.pathToProject);
  }

  private async initialPreviewCommit(dirPath: string) {
    await spawnProcess('git', ['init'], {cwd: dirPath, stdio: 'ignore'});
    await spawnProcess('git', ['add', '.'], {cwd: dirPath, stdio: 'ignore'});
    await spawnProcess('git', ['commit', `--message=${this.orgId} currently`], {
      cwd: dirPath,
      stdio: 'ignore',
    });
  }

  private recursiveDirectoryDiff(
    currentDir: string,
    previewDir: string
  ): string[] {
    const files = readdirSync(previewDir, {withFileTypes: true});
    const filePaths: string[] = [];
    files.forEach((file) => {
      if (file.isDirectory()) {
        filePaths.push(
          ...this.recursiveDirectoryDiff(
            join(currentDir, file.name),
            previewDir
          )
        );
      }
      if (file.isFile()) {
        const previewFile = readJSONSync(join(previewDir, file.name));
        const currentFilePath = join(currentDir, file.name);

        if (!existsSync(currentFilePath)) {
          writeJSONSync(join(currentDir, file.name), previewFile, {
            spaces: 2,
          });
          return;
        }

        const currentFile = readJSONSync(currentFilePath);

        const diffedJSON = this.buildDiffedJson(currentFile, previewFile);

        writeJSONSync(join(currentDir, file.name), diffedJSON, {
          spaces: 2,
        });
      }
    });
    return filePaths;
  }

  private buildDiffedJson(
    currentFile: SnapshotFileJSON,
    previewFile: SnapshotFileJSON
  ) {
    const currentResources = this.getResourceDictionnaryFromObject(currentFile);
    const previewResources = this.getResourceDictionnaryFromObject(previewFile);
    const diffedDictionnary = this.getDiffedDictionnary(
      currentResources,
      previewResources
    );

    const diffedResources: ResourcesJSON[] = [];
    diffedDictionnary.forEach((resource) => diffedResources.push(resource));
    diffedResources.sort();

    const resourceType = Object.keys(currentFile.resources)[0];
    const diffedJSON: SnapshotFileJSON = {
      ...currentFile,
      resources: {[resourceType]: diffedResources},
    };
    return diffedJSON;
  }

  private getDiffedDictionnary(
    currentResources: Map<string, ResourcesJSON>,
    previewResources: Map<string, ResourcesJSON>
  ) {
    if (this.shouldDelete) {
      return previewResources;
    }
    const diffedResources = new Map<string, ResourcesJSON>(currentResources);
    const iterator = previewResources.keys();
    for (
      let resource = iterator.next();
      !resource.done;
      resource = iterator.next()
    ) {
      const previewResource = previewResources.get(resource.value);
      if (previewResource) {
        diffedResources.set(resource.value, previewResource);
      }
    }
    return diffedResources;
  }

  private getResourceDictionnaryFromObject(snapshotFile: SnapshotFileJSON) {
    const dictionnary = new Map<string, ResourcesJSON>();
    const resourcesSection = snapshotFile.resources;
    for (const resourceType in resourcesSection) {
      const resources = resourcesSection[resourceType as ResourceSnapshotType];
      resources?.forEach((resource) => {
        dictionnary.set(resource.resourceName, resource);
      });
    }
    return dictionnary;
  }

  private async applySnapshotToPreview(dirPath: string) {
    this.recursiveDirectoryDiff(
      join(dirPath, 'resources'),
      this.previewedSnapshotDirPath
    );
    await spawnProcess('git', ['add', '.'], {cwd: dirPath, stdio: 'ignore'});
    await spawnProcess(
      'git',
      ['commit', `--message=${this.orgId} after snapshot application`],
      {
        cwd: dirPath,
        stdio: 'ignore',
      }
    );
  }

  private async getBeforeSnapshot() {
    const snapshot = await SnapshotFactory.createFromOrg(
      this.resourcesToPreview,
      this.orgId
    );

    return snapshot.download();
  }
}
