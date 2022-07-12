import {SnapshotDiffModel} from '@coveord/platform-client';

import {html, parse} from 'diff2html';
import {readFileSync} from 'fs-extra';
import {EOL} from 'os';
import {Project} from '../../project/project';

export class DiffViewer {
  private static readonly previewDirectoryName = 'preview';
  // public constructor(private model: SnapshotDiffModel, projectPath: string) {}
  public constructor(
    private readonly report: SnapshotDiffModel,
    private readonly projectToPreview: Project
  ) {}

  // private static get previewDirectory() {
  //   return join(
  //     DotFolder.hiddenFolderName,
  //     ExpandedPreviewer.previewDirectoryName
  //   );
  // }

  // public async preview() {
  //   if (existsSync(ExpandedPreviewer.previewDirectory)) {
  //     this.deleteOldestPreviews();
  //   }
  //   const previewLocalSlug = `${this.orgId}-${Date.now()}`;
  //   const dirPath = join(ExpandedPreviewer.previewDirectory, previewLocalSlug);

  //   mkdirSync(dirPath, {
  //     recursive: true,
  //   });
  //   const project = new Project(resolve(dirPath));
  //   CliUx.ux.action.start('Generating preview details');
  //   await this.initPreviewDirectory(dirPath, project);
  //   await this.applySnapshotToPreview(dirPath);
  //   const commitHash = await this.getCommitHash(dirPath);

  //   CliUx.ux.info(dedent`

  //   A Git repository representing the modification has been created here:
  //   ${dirPath}

  //   with the associated commit hash: ${commitHash.stdout}
  //   `);
  //   CliUx.ux.action.stop(green('✔'));
  // }

  public display() {
    throw 'TODO:';
  }

  private get hasChanges() {
    return Object.keys(this.report.files).length >= 0;
  }
}
