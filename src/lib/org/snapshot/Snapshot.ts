// import ResourceSnapshotsModel from '@coveord/platform-client';
// import {backOff} from 'exponential-backoff';

class Snapshot {
  constructor() {}

  async list(): Promise<string[]> {
    // Do some async stuff
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(['sdf', 'sdfgh', '34tg']);
      }, 1200);
    });
  }
}

export = Snapshot;
