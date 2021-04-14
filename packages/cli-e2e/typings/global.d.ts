import type {ProcessManager} from '../utils/processManager';

declare global {
  namespace NodeJS {
    interface Global {
      processManager: ProcessManager | undefined;
    }
  }
}
