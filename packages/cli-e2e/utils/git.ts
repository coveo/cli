import {ProcessManager} from './processManager';
import {DoCallback} from './terminal/do';
import {Terminal} from './terminal/terminal';

export const isDirectoryClean = async (
  processManager: ProcessManager,
  pathToRepo: string,
  projectName: string,
  errorCallback: DoCallback
) => {
  const gitStatusTerminal = new Terminal(
    'git',
    ['status', '--porcelain'],
    {cwd: pathToRepo},
    processManager,
    `status-${projectName}`
  );

  const gitStatusExitCondition = gitStatusTerminal
    .when('exit')
    .on('process')
    .do()
    .once();

  // await gitStatusTerminal
  // .when(/.+/)
  // .on('process')
  // .do(errorCallback)
  // .until(gitStatusExitCondition);

  const notAGitRepository = gitStatusTerminal
    .when(/.+/)
    .on('stderr')
    .do(errorCallback)
    .until(gitStatusExitCondition);

  const isDirtyWorkingTree = gitStatusTerminal
    .when(/.+/)
    .on('stdout')
    .do(errorCallback)
    .until(gitStatusExitCondition);

  await Promise.race([notAGitRepository, isDirtyWorkingTree]);
};

export const commitProject = async (
  processManager: ProcessManager,
  pathToRepo: string,
  projectName: string,
  errorCallback: DoCallback
) => {
  const gitAddTerminal = new Terminal(
    'git',
    ['add', '.'],
    {cwd: pathToRepo},
    processManager,
    `add-${projectName}`
  );

  await gitAddTerminal.when('exit').on('process').do().once();

  const gitCommitTerminal = new Terminal(
    'git',
    ['commit', '-m', '"e2e first commit"'],
    {cwd: pathToRepo},
    processManager,
    `commit-${projectName}`
  );

  const gitCommitExitCondition = gitCommitTerminal
    .when('exit')
    .on('process')
    .do()
    .once();

  await gitCommitTerminal
    .when(/✖ \d+ problems \(\d+ errors, \d+ warnings\)/)
    .on('stderr')
    .do(errorCallback)
    .until(gitCommitExitCondition);
};

export const undoCommit = async (
  processManager: ProcessManager,
  pathToRepo: string,
  projectName: string
) => {
  const gitTerminal = new Terminal(
    'git',
    ['reset', 'HEAD~'],
    {cwd: pathToRepo},
    processManager,
    `undo-${projectName}`
  );

  await gitTerminal.when('exit').on('process').do().once();
};
