import {closeAllPages, connectToChromeBrowser} from './utils/browser';

export default async function () {
  const cleaningPromises = [Promise.resolve()];
  if (process.env.CI) {
    const browser = await connectToChromeBrowser();
    cleaningPromises.push(...(await closeAllPages(browser)));
  }
  if (global.processManager) {
    cleaningPromises.push(global.processManager.killAllProcesses());
  }
  await Promise.all(cleaningPromises);
}
