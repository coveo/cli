import extract from 'extract-zip';
import {
  ResourceSnapshotsReportModel,
  ResourceSnapshotType,
} from '@coveord/platform-client';
import {mkdirSync, readdirSync} from 'fs';
import {readJSONSync, writeJSONSync} from 'fs-extra';
import {join, resolve} from 'path';
import {Project} from '../project/project';
import {spawnProcess} from '../utils/process';
import {SnapshotFactory} from './snapshotFactory';

type ResourcesJSON = Object & {resourceName: string};

type SnapshotFileJSON = Object & {
  resources: Partial<{[key in ResourceSnapshotType]: ResourcesJSON[]}>;
};

export class ExpandedPreviewer {
  private static readonly temporaryDirectory: string = '.coveo/tmp';
  private static readonly previewDirectory: string = '.coveo/preview';

  private resourcesToPreview: ResourceSnapshotType[];

  public constructor(
    private readonly report: ResourceSnapshotsReportModel,
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
  }

  private async initPreviewDirectory(project: Project) {
    const beforeSnapshot = await this.getBeforeSnapshot();
    await project.refresh(beforeSnapshot);
    await this.initialPreviewCommit(project.pathToProject);
  }

  private async initialPreviewCommit(dirPath: string) {
    await spawnProcess('git', ['init'], {cwd: dirPath});
    await spawnProcess('git', ['add', '.'], {cwd: dirPath});
    await spawnProcess('git', ['commit', '-m', `"${this.orgId} currently"`], {
      cwd: dirPath,
    });
  }

  private recursiveDirectoryDiff(
    currentDir: string,
    previewDir: string
  ): string[] {
    const files = readdirSync(currentDir, {withFileTypes: true});
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
        const currentFile = readJSONSync(join(currentDir, file.name));
        const previewFile = readJSONSync(join(previewDir, file.name));

        const currentResources =
          this.getResourceDictionnaryFromObject(currentFile);
        const previewResources =
          this.getResourceDictionnaryFromObject(previewFile);

        const diffedResources = this.getDiffedDictionnary(
          currentResources,
          previewResources
        );

        writeJSONSync(join(previewDir, file.name), diffedResources);
      }
    });
    return filePaths;
  }

  private getDiffedDictionnary(
    currentResources: Map<string, Object>,
    previewResources: Map<string, Object>
  ) {
    if (this.shouldDelete) {
      return previewResources;
    }
    const diffedResources = new Map<string, Object>(currentResources);
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
    const dictionnary = new Map<string, Object>();
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
    this.recursiveDirectoryDiff(dirPath, this.previewedSnapshotDirPath);

    await extract(this.previewedSnapshotDirPath, {dir: dirPath});
    await spawnProcess('git', ['add', '.'], {cwd: dirPath});
    await spawnProcess(
      'git',
      ['commit', '-m', `"${this.orgId} after snapshot application"`],
      {
        cwd: dirPath,
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
