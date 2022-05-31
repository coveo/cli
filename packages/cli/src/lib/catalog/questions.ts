// const shouldMapStandardFields = await CliUx.ux.confirm(
//   'Would you like to map standard fields to your catalog?'
// );
// const unmapped = getUnmappedFieldMappings(fieldNames);
// const hasUnmappedFieldsMappings = Object.keys(unmapped).length > 0;
// if (hasUnmappedFieldsMappings && shouldMapStandardFields) {
//   model.fieldsMapping = {
//     ...model.fieldsMapping,
//     ...getStandardFieldMappings(fieldNames),
//   };
// }

// Catalog Id field step
// - Select the value attributed to your Product object type.
// - Select your Product ID field (if no variant is selected, ask "select your product SKU field")
// - The product ID is used to link the product to its variant. The field must appear on both types of objects. (if no variant is selected, ask "The SKU is used to identify each sellable unit.")
// Prompt for product Id field and obejct type

// if (catalogStructure.variant) {
// - Select the value attributed to your Variant object type.
// - Select your Product SKU field
// - The SKU is used to identify each sellable unit.
//   // Prompt for variant Id field and obejct type
// }

// if (catalogStructure.availabilities) {
//   // Prompt for availabilities Id field and obejct type
// }

// TODO: CDX-978: prompt user for source ids. If the there are no sources in the org, create them

export interface CatalogStructure {
  products: boolean;
  variants: boolean;
  availabilities: boolean;
}

// export const defaultCatalogStructure: CatalogStructure = {
//   products: true,
//   variants: false,
//   availabilities: false,
// };

export function selectCatalogStructure(
  objectTypes: string[]
): CatalogStructure {
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
