import {SnapshotDiffModel} from '@coveord/platform-client';
import {CliUx} from '@oclif/core';
import axios from 'axios';
import {green} from 'chalk';
import {writeFileSync} from 'fs';
import {mkdirSync, Dirent, existsSync, readdirSync, rmSync} from 'fs-extra';
import {join} from 'path';
import {Project} from '../../project/project';

export class SnapshotDiffReporter {
  private static readonly previewDirectoryName = 'preview';
  private static previewHistorySize = 1;
  // public constructor(private model: SnapshotDiffModel, projectPath: string) {}
  public constructor(
    private readonly report: SnapshotDiffModel,
    private readonly projectToPreview: Project
  ) {}

  private static get previewDirectory() {
    return join(SnapshotDiffReporter.previewDirectoryName);
  }

  public async preview() {
    if (!this.hasChanges) {
      CliUx.ux.action.start('No diff to view');
      return;
    }

    if (existsSync(SnapshotDiffReporter.previewDirectory)) {
      this.deleteOldestPreviews();
    }
    const dirPath = join(
      SnapshotDiffReporter.previewDirectory,
      this.report.snapshotId
    );

    mkdirSync(dirPath, {
      recursive: true,
    });

    for (const [resourceName, diffModel] of Object.entries(this.report.files)) {
      const diffFilePath = join(dirPath, `${resourceName}.patch`);
      await this.downloadDiff(diffFilePath, diffModel.url);
    }
    CliUx.ux.action.stop(green('✔'));
  }

  private async downloadDiff(downloadPath: string, url: string) {
    const {data} = await axios.get(url, {method: 'GET', responseType: 'blob'});
    writeFileSync(downloadPath, data);
  }

  private deleteOldestPreviews() {
    const getFilePath = (fileDirent: Dirent) =>
      join(SnapshotDiffReporter.previewDirectory, fileDirent.name);

    const allFiles = readdirSync(SnapshotDiffReporter.previewDirectory, {
      withFileTypes: true,
    });
    const dirs = allFiles.filter((potentialDir) => potentialDir.isDirectory());

    while (dirs.length >= SnapshotDiffReporter.previewHistorySize) {
      rmSync(getFilePath(dirs.shift()!), {
        recursive: true,
        force: true,
      });
    }
  }

  private get hasChanges() {
    return Object.keys(this.report.files).length >= 0;
  }
}
