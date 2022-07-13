import {SnapshotDiffModel} from '@coveord/platform-client';
import {CliUx} from '@oclif/core';
import axios from 'axios';
import {green} from 'chalk';
import {
  mkdirSync,
  existsSync,
  readdirSync,
  writeFileSync,
  Dirent,
  rmSync,
} from 'fs-extra';
import {join} from 'path';

export class SnapshotDiffReporter {
  private static readonly previewDirectoryName = 'preview';
  private static previewHistorySize = 1;

  public constructor(
    private readonly report: SnapshotDiffModel,
    private readonly projectPath: string
  ) {}

  private get previewDirectory() {
    return join(this.projectPath, SnapshotDiffReporter.previewDirectoryName);
  }

  public async preview() {
    if (!this.hasChanges) {
      CliUx.ux.action.start('No diff to view');
      return;
    }

    if (existsSync(this.previewDirectory)) {
      this.deleteOldestPreviews();
    }
    const dirPath = join(this.previewDirectory, this.report.snapshotId);

    mkdirSync(dirPath, {
      recursive: true,
    });

    for (const [resourceName, diffModel] of Object.entries(this.report.files)) {
      const diffFilePath = join(dirPath, `${resourceName}.patch`);
      await this.downloadDiff(diffModel.url, diffFilePath);
    }
    CliUx.ux.action.stop(green('✔'));
  }

  private async downloadDiff(diffUrl: string, outputFile: string) {
    const {data} = await axios.get(diffUrl, {
      method: 'GET',
      responseType: 'blob',
    });
    writeFileSync(outputFile, data);
  }

  private deleteOldestPreviews() {
    const getFilePath = (fileDirent: Dirent) =>
      join(this.previewDirectory, fileDirent.name);

    const allFiles = readdirSync(this.previewDirectory, {
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
