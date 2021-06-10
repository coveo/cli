import {spawnSync} from 'child_process';
import {constants as OsConstants} from 'os';
import isProcessRunning from 'is-running';
import type {ChildProcess} from 'child_process';
import {resolve} from 'path';

const phantomKillerPath = resolve(
  __dirname,
  'PhantomKiller',
  'phantom-killer.ps1'
);

/**
 * Simple representation of a process and its child processes.
 */
class Process {
  public childProcesses: Process[];
  public constructor(public pid: number) {
    this.childProcesses = [];
  }
}

/**
 * Kill a process and all its children
 * @param pid the PID of the process to kill with all its descendants
 */
export function recurseProcessKillWindows(processToKill: ChildProcess) {
  const pid = processToKill.pid;
  const processGraph = getProcessGraph();
  const root = processGraph.get(pid);

  if (!root) {
    console.log(`process with ${pid} pid not found on PowerShell.`);
    if (isProcessRunning(pid)) {
      console.log('Process MIA');
    } else {
      console.log('Process death confirmed');
      // Process confirmed dead by Sys. Release it from Node.js lifecycle
      processToKill.emit('exit', 0);
      processToKill.unref();
    }
    return;
  } else {
    recursiveKilling(root);
  }
  killZombieProcesses();
}

const recursiveKilling = (inputProcess: Process) => {
  inputProcess.childProcesses.forEach((child) => recursiveKilling(child));
  // Kill the Process without checking if we own it and wait for it to die.
  const killCommand = `Stop-Process -Force -Id ${inputProcess.pid} -PassThru | Wait-Process`;
  try {
    spawnSync('powershell.exe', ['-Command', killCommand], {
      encoding: 'utf-8',
    });
  } catch (error) {
    if (error.errno !== OsConstants.errno.ESRCH) {
      throw error;
    }
  }
};

function getProcessGraph(): Map<number, Process> {
  // PowerShell magic command that get all the Process PID and PPID in a flat JSON array with the least spacing possible.
  const rawPowershell = spawnSync('powershell.exe', [
    '-Command',
    'Get-CimInstance -ClassName Win32_Process -Property ProcessId,ParentProcessId | ConvertTo-Json -Depth 1 -Compress',
  ]);

  const processDataArray = JSON.parse(
    rawPowershell.stdout.toString(),
    (_key, value) => (value ? value : undefined) //Filter out the falsy values to keep things sane memory-wise. (and, yes that filters PID 0, but if you want to kill Process 0, you got a problem, see https://stackoverflow.com/questions/3232401/windows-pid-0-valid and https://unix.stackexchange.com/questions/83322/which-process-has-pid-0)
  );

  const processGraph = new Map<number, Process>();
  const incompleteEdges = new Map<number, Set<Process>>();
  processDataArray.forEach(
    (processData: {ProcessId: number; ParentProcessId: number}) => {
      const newProcess = new Process(processData['ProcessId']);
      // Handle parent
      buildGraphUpStream(processData, newProcess);

      // Handle orphans
      buildGraphDownStream(newProcess);
      processGraph.set(newProcess.pid, newProcess);
    }
  );
  return processGraph;

  function buildGraphDownStream(newProcess: Process) {
    const possibleOrphans = incompleteEdges.get(newProcess.pid);
    possibleOrphans?.forEach((orphan) => {
      newProcess.childProcesses.push(orphan);
    });
  }

  function buildGraphUpStream(
    processData: {ProcessId: number; ParentProcessId: number},
    newProcess: Process
  ) {
    const possibleParent = processGraph.get(processData.ParentProcessId);
    if (possibleParent) {
      possibleParent.childProcesses.push(newProcess);
    } else {
      // If we didn't find the parent, register the process a orphan, so that when the parent is processed it get registered.
      registerOrphan(processData, newProcess);
    }
  }

  function registerOrphan(
    processData: {ProcessId: number; ParentProcessId: number},
    newProcess: Process
  ) {
    let edgesWaitingForParentToBeDiscovered = new Set<Process>();
    if (!incompleteEdges.has(processData.ParentProcessId)) {
      incompleteEdges.set(
        processData.ParentProcessId,
        edgesWaitingForParentToBeDiscovered
      );
    } else {
      edgesWaitingForParentToBeDiscovered = incompleteEdges.get(
        processData.ParentProcessId
      )!;
    }
    edgesWaitingForParentToBeDiscovered.add(newProcess);
  }
}

const killZombieProcesses = () => {
  const badProcessesName = ['node', 'conhost'];
  badProcessesName.forEach((processName) => {
    const zombieKillerStdout = spawnSync('powershell.exe', [
      '-File',
      phantomKillerPath,
      '-ProcessName',
      processName,
    ]).stdout;
    console.log(zombieKillerStdout);
  });
};
