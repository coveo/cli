import inquirer from 'inquirer';
import {renderer} from './renderer';
import {checkboxControls as controls} from './controls';
import {
  CustomizablePromptAnswers,
  CustomizablePrompt,
} from 'inquirer-customizable';
import chalk from 'chalk';
import {ResourceSnapshotType} from '@coveord/platform-client';
import Separator from 'inquirer/lib/objects/separator';
import {ResourceTypeActions} from './interfaces';

const PromptValueColorMap = {
  [ResourceTypeActions.Add]: chalk.green,
  [ResourceTypeActions.Delete]: chalk.red,
  [ResourceTypeActions.Edit]: chalk.cyan,
  [ResourceTypeActions.Skip]: chalk.white,
};

const boldCapitalizeString = (string: string) =>
  string
    ? chalk.bold`${string[0].toUpperCase()}` + string.substring(1)
    : string;

const resourceTypePromptValues = Object.values(ResourceTypeActions).map(
  (promptValue) => ({
    displayName: PromptValueColorMap[promptValue](
      boldCapitalizeString(promptValue)
    ),
    id: promptValue,
  })
);

// TODO CDX-499: Use proper strings.
const resourceTypePromptKeys = Object.values(ResourceSnapshotType).map(
  (resourceType) => ({displayName: resourceType, id: resourceType})
);

type ResourcePromptDefaults = Partial<
  Record<ResourceSnapshotType, ResourceTypeActions>
>;

export async function getSelectResourceTypesPrompt(
  question: string,
  defaults: ResourcePromptDefaults = {}
) {
  inquirer.registerPrompt(CustomizablePrompt.name, CustomizablePrompt);
  const answers = await inquirer.prompt<CustomizablePromptAnswers>([
    {
      type: CustomizablePrompt.name,
      name: question,
      keys: [...resourceTypePromptKeys, new Separator('*')],
      values: resourceTypePromptValues,
      controls,
      renderer,
      default: defaults,
      disabled: getDisabledFromDefaults(defaults),
      shouldLoop: true,
    },
  ]);
  console.log(`Prompt session complete, here's the object that inquirer would return
  ${JSON.stringify(answers)}`);
  return answers;
}

function getDisabledFromDefaults(
  defaults: Partial<Record<ResourceSnapshotType, ResourceTypeActions>>
) {
  const disabledMap: Partial<
    Record<ResourceSnapshotType, ResourceTypeActions[]>
  > = {};
  for (const resourceType of Object.values(ResourceSnapshotType)) {
    disabledMap[resourceType] = defaults[resourceType]
      ? validActionIfExisting
      : validActionIfNotExisting;
  }
}

const validActionIfExisting = Object.values(ResourceTypeActions).filter(
  (action) => action !== ResourceTypeActions.Add
);

const validActionIfNotExisting = Object.values(ResourceTypeActions).filter(
  (action) =>
    [ResourceTypeActions.Delete, ResourceTypeActions.Edit].includes(action)
);
