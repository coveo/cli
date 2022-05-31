export interface boaboa {
  products: boolean;
  variants: boolean;
  availabilities: boolean;
}

export function getCatalogStructure(objectTypes: string[]): boaboa {
  const catalogStructure = prompt({
    message: 'Select your catalog data structure',
    type: 'checkbox',
    choices: [
      {name: 'products', value: 'Products', checked: true},
      {name: 'variants', value: 'Variants'},
      {name: 'availabilities', value: 'Availabilities'},
    ],
    validate: (input: string, ans: Answers) => {
      console.log('*********************');
      console.log(objectTypes.length);
      console.log(input);
      console.log('*********************');
      return 'you have selected more data structure than blabla objecttype blabla in your data';
    },
  });
  // Select the object types your catalog should include
  throw 'TODO:';
}

export function selectObjectTypeField(
  objectType: 'product' | 'variant' | 'availability', // TODO: find a type
  fields: string[]
): string {
  throw 'TODO:';
}
export function selectIdField(
  objectType: 'product' | 'variant' | 'availability', // TODO: find a type
  fields: string[]
): string {
  throw 'TODO:';
}

export function selectStandardFieldMapping(
  standardFieldName: string,
  fields: string[]
): string {
  throw 'TODO:';
  // prompt({
  //   message: `Choose a metadata to associate to the standard field ${bold(u)}`,
  //   type: 'list',
  //   choices: fields,
  // });
}
