import {ProcessManager} from './processManager';
import {Terminal} from './terminal/terminal';

export const commitProject = async (
  processManager: ProcessManager,
  projectName: string
) => {
  const gitTerminal = new Terminal(
    'git',
    ['add', '.', '&&', 'git', 'commit', '-m', '"e2e first commit"'],
    {cwd: projectName},
    processManager,
    `commit-${projectName}`
  );

  await gitTerminal.when('exit').on('process').do().once();
};

export const undoCommit = async (
  processManager: ProcessManager,
  projectName: string
) => {
  const gitTerminal = new Terminal(
    'git',
    ['git', 'reset', 'HEAD~'],
    {cwd: projectName},
    processManager,
    `undo-${projectName}`
  );

  await gitTerminal.when('exit').on('process').do().once();
};
