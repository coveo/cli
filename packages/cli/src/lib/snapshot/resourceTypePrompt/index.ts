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
import {
  SnapshotPullModelResourceType,
  SnapshotPullModelResourceTypes,
} from '../pullModel/interfaces';

const PromptValueColorMap = {
  [ResourceTypeActions.Add]: chalk.green,
  [ResourceTypeActions.Delete]: chalk.red,
  [ResourceTypeActions.Edit]: chalk.cyan,
  [ResourceTypeActions.Skip]: chalk.whiteBright,
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
const resourceTypePromptKeys = Object.values(
  SnapshotPullModelResourceTypes
).map((resourceType) => ({displayName: resourceType, id: resourceType}));

export type ResourcePromptDefaults = Partial<
  Record<SnapshotPullModelResourceType, ResourceTypeActions>
>;

export type UnsupportedResources = Exclude<
  ResourceSnapshotType,
  SnapshotPullModelResourceType
>;

const resourcePromptDefaults: Required<ResourcePromptDefaults> = {
  EXTENSION: ResourceTypeActions.Skip,
  FIELD: ResourceTypeActions.Skip,
  ML_MODEL: ResourceTypeActions.Skip,
  QUERY_PIPELINE: ResourceTypeActions.Skip,
  SEARCH_PAGE: ResourceTypeActions.Skip,
  SOURCE: ResourceTypeActions.Skip,
  SUBSCRIPTION: ResourceTypeActions.Skip,
};

export async function getSelectResourceTypesPrompt(
  question: string,
  defaults: ResourcePromptDefaults = resourcePromptDefaults
) {
  // Legit: We have 8 custom key chords + enter + default.
  process.stdin.setMaxListeners(11);
  inquirer.registerPrompt(CustomizablePrompt.name, CustomizablePrompt);
  const answers = await inquirer.prompt<CustomizablePromptAnswers>([
    {
      type: CustomizablePrompt.name,
      name: question,
      keys: [...resourceTypePromptKeys, new Separator('*')],
      values: resourceTypePromptValues,
      controls,
      renderer,
      default: {...resourcePromptDefaults, ...defaults},
      disabled: getDisabledFromDefaults(defaults),
      shouldLoop: true,
    },
  ]);
  console.log(`Prompt session complete, here's the object that inquirer would return
  ${JSON.stringify(answers)}`);
  return answers;
}

function getDisabledFromDefaults(defaults: ResourcePromptDefaults) {
  const disabledMap: Partial<
    Record<SnapshotPullModelResourceType, ResourceTypeActions[]>
  > = {};
  for (const resourceType of SnapshotPullModelResourceTypes) {
    disabledMap[resourceType] = defaults[resourceType]
      ? invalidActionIfExisting
      : invalidActionIfNotExisting;
  }
  return disabledMap;
}

const invalidActionIfExisting = [ResourceTypeActions.Add];

const invalidActionIfNotExisting = Object.values(ResourceTypeActions).filter(
  (action) =>
    [ResourceTypeActions.Delete, ResourceTypeActions.Edit].includes(action)
);
