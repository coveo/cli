import {html, parse} from 'diff2html';
import {SnapshotDiffModel} from '@coveord/platform-client';
import {readFileSync} from 'fs-extra';
import {EOL} from 'os';

export class DiffViewer {
  // public constructor(private model: SnapshotDiffModel, projectPath: string) {}
  public constructor() {}

  public diff() {
    // if files.length === 0 return
    // if (!this.hasChanges) return;
    // TODO: save into project
    // TODO: open in browser
    const pipeliens = readFileSync('./diff-query-pipeline').toString();
    const fields = readFileSync('./diff-field').toString();
    const diffPipelineJson = parse([pipeliens, fields].join(EOL));
    const diffFieldJson = parse(fields);
    const diffHtml = html(diffPipelineJson, {
      drawFileList: true,
      // fileListStartVisible: false,
      // fileContentToggle: false,
      // matching: 'lines',
      // outputFormat: 'side-by-side',
      // synchronisedScroll: true,
      // highlight: true,

      // renderNothingWhenEmpty: false,
    });

    return diffHtml;
  }

  // private get hasChanges() {
  //   return Object.keys(this.model.files).length >= 0;
  // }
}

const viewer = new DiffViewer();
console.log(viewer.diff());
