import {closeAllPages, connectToChromeBrowser} from './utils/browser';
import {deleteAllCliApiKeys} from './utils/cli';

export default async function () {
  const browser = await connectToChromeBrowser();
  const pageClosePromises = await closeAllPages(browser);
  await deleteAllCliApiKeys();
  if (global.processManager) {
    await global.processManager.killAllProcesses();
  }
  return Promise.all(pageClosePromises);
}
