/// <reference path='../../typings/inquirer/inquirer-autocomplete-prompt.d.ts'/>
import {filter} from 'fuzzy';
import {bold} from 'chalk';
import inquirer from 'inquirer';
import autocompletePrompt from 'inquirer-autocomplete-prompt';
import {pluralizeIfNeeded} from '../utils/string';

inquirer.registerPrompt('autocomplete', autocompletePrompt);

export interface CatalogStructure {
  products: boolean;
  variants: boolean;
  availabilities: boolean;
}

export const defaultCatalogStructure: CatalogStructure = {
  products: true,
  variants: false,
  availabilities: false,
};

export async function selectCatalogStructure(
  availableObjectTypes: string[]
): Promise<CatalogStructure> {
  if (availableObjectTypes.length === 1) {
    return defaultCatalogStructure;
  }

  const typePluralized = pluralizeIfNeeded(
    ['type', 'types'],
    availableObjectTypes.length - 1
  );
  const answer = await inquirer.prompt({
    message: `Select the additional object ${typePluralized} your catalog should include`,
    name: 'objectTypes',
    type: 'checkbox',
    choices: [
      {name: 'Variants', value: 'variants'},
      {name: 'Availabilities', value: 'availabilities'},
    ],
    validate: (selectedObjectTypes: string[]) => {
      if (selectedObjectTypes.length > availableObjectTypes.length - 1) {
        return 'Cannot select more objecttype values than what is avaialble in your documents';
      }
      return true;
    },
  });
  const objectTypeArray = [answer.objectTypes].flatMap((o) => o);
  return {
    ...defaultCatalogStructure,
    variants: objectTypeArray.includes('variants'),
    availabilities: objectTypeArray.includes('availabilities'),
  };
}

export async function selectObjectTypeField(
  objectType: 'product' | 'variant' | 'availability',
  fields: string[]
): Promise<string> {
  const answer = await inquirer.prompt({
    message: `Select the value attributed to your ${bold(
      objectType
    )} object type.`,
    name: 'fieldName',
    type: 'autocomplete',
    source: (_answersSoFar: string, input: string) => {
      const results = filter(input, fields);
      return results.map((v) => v.string || v);
    },
  });
  return answer.fieldName;
}

export async function selectIdField(
  message: string,
  fields: string[]
): Promise<string> {
  const answer = await inquirer.prompt({
    message,
    name: 'fieldName',
    type: 'autocomplete',
    source: (_answersSoFar: string, input: string) => {
      const results = filter(input, fields);
      return results.map((v) => v.string || v);
    },
  });
  return answer.fieldName;
}