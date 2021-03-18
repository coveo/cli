/* eslint-disable @typescript-eslint/no-namespace */
import {ChildProcessWithoutNullStreams} from 'child_process';
import {closeAllPages, connectToChromeBrowser} from './utils/browser';
import {killCliProcess} from './utils/cli';

declare global {
  namespace NodeJS {
    interface Global {
      loginProcess: ChildProcessWithoutNullStreams | undefined;
    }
  }
}

export default async function () {
  const browser = await connectToChromeBrowser();
  const pageClosePromises = await closeAllPages(browser);
  if (global.loginProcess) {
    await killCliProcess(global.loginProcess);
  }
  return Promise.all(pageClosePromises);
}
