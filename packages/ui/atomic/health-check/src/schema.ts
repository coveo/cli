import type {Schema} from 'jsonschema';

export const ComponentSchema: Schema = {
  type: 'object',
  required: ['name', 'unpkg'],
  properties: {
    keywords: {
      required: true,
      type: 'array',
      enum: ['coveo-atomic-component'],
      description:
        'Your component should include "coveo-atomic-component" in its keywords, otherwise it will not be indexed. For more info, visit https://docs.npmjs.com/cli/v9/configuring-npm/package-json#keywords',
    },
    description: {
      required: true,
      type: 'string',
      minLength: 20,
      description:
        "You should provide a description of at least 20 characters explaining the component's purpose",
    },
    repository: {
      required: true,
      description:
        'You need to provide an URL to the component source code. For more info, visit https://docs.npmjs.com/cli/v9/configuring-npm/package-json#repository',
      anyOf: [
        {
          type: 'string',
        },
        {
          type: 'object',
          required: ['url'],
        },
      ],
    },
  },
};
