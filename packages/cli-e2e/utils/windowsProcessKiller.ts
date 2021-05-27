import {spawnSync} from 'child_process';
import {constants as OsConstants} from 'os';

class Process {
  public childProcesses: Process[];
  constructor(public pid: number) {
    this.childProcesses = [];
  }
}

export function recurseProcessKillWindows(pid: number) {
  const collection = getProcessGraph();
  const root = collection.get(pid);

  if (!root) {
    throw 'root aint there';
  }
  recursiveKilling(root);
}

const recursiveKilling = (inputProcess: Process) => {
  inputProcess.childProcesses.forEach((child) => recursiveKilling(child));
  try {
    process.kill(inputProcess.pid);
  } catch (error) {
    if (error.errno !== OsConstants.errno.ESRCH) {
      throw error;
    }
  }
};

function getProcessGraph(): Map<number, Process> {
  const rawPowershell = spawnSync('powershell.exe', [
    '-Command',
    'Get-CimInstance -ClassName Win32_Process -Property ProcessId,ParentProcessId | ConvertTo-Json -Depth 1 -Compress',
  ]);

  const processDataArray = JSON.parse(
    rawPowershell.stdout.toString(),
    (_key, value) => (value ? value : undefined)
  );

  const processGraph = new Map<number, Process>();
  const incompleteEdges = new Map<number, Set<Process>>();
  processDataArray.forEach(
    (processData: {ProcessId: number; ParentProcessId: number}) => {
      const newProcess = new Process(processData['ProcessId']);
      // Handle parent
      const possibleParent = processGraph.get(processData.ParentProcessId);
      if (possibleParent) {
        possibleParent.childProcesses.push(newProcess);
      } else {
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

      // Handle orphans
      const possibleOrphans = incompleteEdges.get(newProcess.pid);
      possibleOrphans?.forEach((orphan) => {
        newProcess.childProcesses.push(orphan);
      });
      processGraph.set(newProcess.pid, newProcess);
    }
  );
  return processGraph;
}
