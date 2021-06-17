import {
  ResourceSnapshotsReportModel,
  ResourceType,
} from '@coveord/platform-client';
import decompress from 'decompress';
import {mkdirSync} from 'fs';
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
    private readonly snapshotToPreviewZipPath: string
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

  private async applySnapshotToPreview(dirPath: string) {
    await decompress(this.snapshotToPreviewZipPath, dirPath);
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
