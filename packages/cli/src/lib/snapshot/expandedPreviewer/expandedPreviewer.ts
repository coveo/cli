import {
  ResourceSnapshotsReportModel,
  ResourceSnapshotType,
} from '@coveord/platform-client';
import {mkdirSync, readdirSync, rmSync} from 'fs';
import {join} from 'path';
import {cli} from 'cli-ux';
import {Project} from '../../project/project';
import {spawnProcess} from '../../utils/process';
import {SnapshotFactory} from '../snapshotFactory';
import dedent from 'ts-dedent';
import {Dirent} from 'fs';
import {recursiveDirectoryDiff} from './filesDiffProcessor';
import {DotFolder} from '../../project/dotFolder';

export class ExpandedPreviewer {
  private static readonly previewDirectoryName = 'preview';

  private resourcesToPreview: ResourceSnapshotType[];
  private static previewHistorySize = 5;

  public constructor(
    report: ResourceSnapshotsReportModel,
    private readonly orgId: string,
    private readonly projectToPreview: Project,
    private readonly shouldDelete: boolean
  ) {
    this.resourcesToPreview = Object.keys(
      report.resourceOperationResults
    ) as ResourceSnapshotType[];
  }

  private static get previewDirectory() {
    return join(
      DotFolder.hiddenFolderName,
      ExpandedPreviewer.previewDirectoryName
    );
  }

  public async preview() {
    this.deleteOldestPreviews();
    const previewLocalSlug = `${this.orgId}-${Date.now()}`;
    const dirPath = join(ExpandedPreviewer.previewDirectory, previewLocalSlug);

    mkdirSync(dirPath, {
      recursive: true,
    });
    const project = new Project(dirPath);
    await this.initPreviewDirectory(project);
    await this.applySnapshotToPreview(dirPath);
    // TODO: Remove/move as tests progress.
    if (Date.now() > 0) return;
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

  private async applySnapshotToPreview(dirPath: string) {
    recursiveDirectoryDiff(
      join(dirPath, 'resources'),
      this.projectToPreview.resourcePath,
      this.shouldDelete
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
