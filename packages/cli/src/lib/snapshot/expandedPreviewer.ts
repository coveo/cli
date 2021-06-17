import {
  ResourceSnapshotsReportModel,
  ResourceType,
} from '@coveord/platform-client';
import decompress from 'decompress';
import {mkdirSync, readdirSync} from 'fs';
import {readJSONSync, writeJSONSync} from 'fs-extra';
import {join, resolve} from 'path';
import {spawnProcess} from '../utils/process';
import {SnapshotFactory} from './snapshotFactory';

export class ExpandedPreviewer {
  private static readonly temporaryDirectory: string = '.coveo/tmp';
  private static readonly previewDirectory: string = '.coveo/preview';

  private resourcesToPreview: ResourceType[];

  public constructor(
    private readonly report: ResourceSnapshotsReportModel,
    private readonly orgId: string,
    private readonly previewedSnapshotDirPath: string,
    private readonly shouldDelete: boolean
  ) {
    this.resourcesToPreview = Object.keys(
      report.resourceOperationResults
    ) as ResourceType[];
  }

  /**
   * preview
   */
  public async preview() {
    const previewLocalSlug = `${this.orgId}-${Date.now()}`;
    const dirPath = resolve(
      join(ExpandedPreviewer.previewDirectory, previewLocalSlug)
    );
    await this.initPreviewDirectory(previewLocalSlug, dirPath);
    await this.applySnapshotToPreview(dirPath);
  }

  private async initPreviewDirectory(
    previewLocalSlug: string,
    dirPath: string
  ) {
    const zipPath = join(
      ExpandedPreviewer.temporaryDirectory,
      previewLocalSlug
    );
    mkdirSync(dirPath, {
      recursive: true,
    });
    await this.getFreshSnapshot(zipPath);
    await decompress(zipPath, dirPath);

    await this.initialPreviewCommit(dirPath);
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

  private getResourceDictionnaryFromObject(snapshotFile: any) {
    const dictionnary = new Map<string, Object>();
    const resourcesSection = snapshotFile['resources'];
    for (const resourceType in resourcesSection) {
      const resources = resourcesSection[resourceType];
      resources.forEach((resource: any) => {
        dictionnary.set(resource['resourceName'], resource);
      });
    }
    return dictionnary;
  }

  private async applySnapshotToPreview(dirPath: string) {
    this.recursiveDirectoryDiff(dirPath, this.previewedSnapshotDirPath);

    await decompress(this.previewedSnapshotDirPath, dirPath);
    await spawnProcess('git', ['add', '.'], {cwd: dirPath});
    await spawnProcess(
      'git',
      ['commit', '-m', `"${this.orgId} after snapshot application"`],
      {
        cwd: dirPath,
      }
    );
  }

  private async getFreshSnapshot(zipPath: string) {
    const snapshot = await SnapshotFactory.createFromOrg(
      this.resourcesToPreview,
      this.orgId
    );

    await snapshot.downloadZip(zipPath);
    return;
  }
}
