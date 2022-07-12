import {SnapshotDiffModel} from '@coveord/platform-client';
import {CliUx} from '@oclif/core';
import {green} from 'chalk';
import {writeFileSync} from 'fs';
import {mkdirSync, Dirent, existsSync, readdirSync, rmSync} from 'fs-extra';
import {join} from 'path';
import {DotFolder} from '../../project/dotFolder';
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
    return join(
      DotFolder.hiddenFolderName,
      SnapshotDiffReporter.previewDirectoryName
    );
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

    CliUx.ux.action.start('Generating snapshot diff');
    for (const [file, diffModel] of Object.entries(this.report.files)) {
      const diffFilePath = join(dirPath, file);
      const diffContent = await this.downloadDiff(diffModel.url);
      writeFileSync(diffFilePath, diffContent);
    }
    CliUx.ux.action.stop(green('✔'));
  }

  private async downloadDiff(url: string): Promise<string> {
    throw 'TODO:';
  }

  public display() {
    throw 'TODO:';
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
