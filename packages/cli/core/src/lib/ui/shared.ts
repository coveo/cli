import {confirm, promptChoices, prompt} from '@coveo/cli-commons/utils/ux';
import PlatformClient from '@coveo/platform-client';
import inquirer from 'inquirer';

const manuallyEnterSearchHub = () =>
  prompt('Enter the search hub you want to use', '');

export async function promptForSearchHub(client: PlatformClient) {
  const createSearchHub = await confirm(
    'An API key will be created in your organization. We strongly recommend that you associate this API key with a search hub. Would you like to do so now ? (y/n)',
    false
  );
  if (!createSearchHub) {
    return;
  }

  const availableHubs = await client.searchUsageMetrics.searchHubs.list();
  if (availableHubs.hubs.length === 0) {
    return await manuallyEnterSearchHub();
  }

  const choice = await promptChoices(
    'Use an existing search hub, or create a new one?',
    [
      new inquirer.Separator(),
      'Create a new one',
      new inquirer.Separator(),
      ...availableHubs.hubs.map((hub) => hub.name),
    ],
    ''
  );

  if (choice === 'Create a new one') {
    return await manuallyEnterSearchHub();
  }
  return choice;
}
