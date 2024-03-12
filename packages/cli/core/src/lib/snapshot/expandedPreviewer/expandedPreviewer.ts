import type {
  ResourceSnapshotsReportModel,
  ResourceSnapshotType,
} from '@coveo/platform-client';
import {existsSync, mkdirSync, readdirSync, rmSync} from 'node:fs';
import {join, relative, resolve} from 'node:path';
import {CliUx} from '@oclif/core';
import {Project} from '../../project/project';
import {spawnProcess, spawnProcessOutput} from '../../utils/process';
import {SnapshotFactory} from '../snapshotFactory';
import dedent from 'ts-dedent';
import {Dirent} from 'fs';
import {recursiveDirectoryDiff} from './filesDiffProcessor';
import {DotFolder} from '../../project/dotFolder';
import {cwd} from 'process';
import {buildResourcesToExport} from '../pullModel/validation/model';
import {startSpinner, stopSpinner} from '@coveo/cli-commons/utils/ux';
import {SnapshotReporter} from '../snapshotReporter';

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
    const reporter = new SnapshotReporter(report);
    this.resourcesToPreview = reporter.getAffectedResourceTypes();
  }

  private static get previewDirectory() {
    return join(
      DotFolder.hiddenFolderName,
      ExpandedPreviewer.previewDirectoryName
    );
  }

  public async preview() {
    if (existsSync(ExpandedPreviewer.previewDirectory)) {
      this.deleteOldestPreviews();
    }
    const previewLocalSlug = `${this.orgId}-${Date.now()}`;
    const dirPath = join(ExpandedPreviewer.previewDirectory, previewLocalSlug);

    mkdirSync(dirPath, {
      recursive: true,
    });
    const project = new Project(resolve(dirPath));
    startSpinner('Generating preview details');
    await this.initPreviewDirectory(dirPath, project);
    await this.applySnapshotToPreview(dirPath);
    const commitHash = await this.getCommitHash(dirPath);
    stopSpinner({success: true});
    CliUx.ux.info(dedent`

    A Git repository representing the modification has been created here:
    ${dirPath}

    with the associated commit hash: ${commitHash.stdout}
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

  private async initPreviewDirectory(dirPath: string, project: Project) {
    const beforeSnapshot = await this.getBeforeSnapshot();
    const beforeSnapshotContent = await beforeSnapshot.download();
    await project.refresh(beforeSnapshotContent);
    await this.initialPreviewCommit(dirPath);
    await beforeSnapshot.delete();
  }

  private async getCommitHash(dirPath: string) {
    return spawnProcessOutput('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: dirPath,
    });
  }

  private async initialPreviewCommit(dirPath: string) {
    await spawnProcess('git', ['init'], {cwd: dirPath, stdio: 'ignore'});
    await spawnProcess('git', ['config', 'user.email', 'cli@coveo.com'], {
      cwd: dirPath,
      stdio: 'ignore',
    });
    await spawnProcess('git', ['config', 'user.name', 'Coveo CLI'], {
      cwd: dirPath,
      stdio: 'ignore',
    });
    await spawnProcess('git', ['add', '.'], {cwd: dirPath, stdio: 'ignore'});
    await spawnProcess('git', ['commit', `--message=${this.orgId} currently`], {
      cwd: dirPath,
      stdio: 'ignore',
    });
  }

  private async applySnapshotToPreview(dirPath: string) {
    recursiveDirectoryDiff(
      join(dirPath, 'resources'),
      relative(cwd(), this.projectToPreview.resourcePath),
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
    const resourcesToExport = buildResourcesToExport(this.resourcesToPreview);
    const snapshot = await SnapshotFactory.createFromOrg(
      resourcesToExport,
      this.orgId
    );

    return snapshot;
  }
}
