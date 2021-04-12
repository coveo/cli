import {closeAllPages, connectToChromeBrowser} from './utils/browser';

export default async function () {
  const browser = await connectToChromeBrowser();
  const pageClosePromises = await closeAllPages(browser);
  if (global.processManager) {
    await global.processManager.killAllProcesses();
  }
  return Promise.all(pageClosePromises);
}
