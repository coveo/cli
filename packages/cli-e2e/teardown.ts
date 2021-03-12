import {closeAllPages, connectToChromeBrowser} from './utils/browser';

export default async function () {
  const browser = await connectToChromeBrowser();
  const pageClosePromises = await closeAllPages(browser);
  return Promise.all(pageClosePromises);
}
