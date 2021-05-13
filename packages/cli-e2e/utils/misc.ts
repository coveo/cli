import {ProcessManager} from './processManager';
import {Terminal} from './terminal/terminal';

export const commitProject = async (
  processManager: ProcessManager,
  projectName: string
) => {
  const gitAdd = new Terminal(
    'git',
    ['add', '.'],
    {cwd: projectName},
    processManager,
    `add-${projectName}`
  );

  const gitCommit = new Terminal(
    'git',
    ['commit', '-m', '"e2e first commit"'],
    {cwd: projectName},
    processManager,
    `commit-${projectName}`
  );

  await gitAdd.when('exit').on('process').do().once();
  await gitCommit.when('exit').on('process').do().once();
};

export const undoCommit = async (
  processManager: ProcessManager,
  projectName: string
) => {
  const gitTerminal = new Terminal(
    'git',
    ['reset', 'HEAD~'],
    {cwd: projectName},
    processManager,
    `undo-${projectName}`
  );

  await gitTerminal.when('exit').on('process').do().once();
};
