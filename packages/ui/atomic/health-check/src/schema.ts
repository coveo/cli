import type {Schema} from 'jsonschema';

export const ComponentSchema: Schema = {
  type: 'object',
  required: ['name', 'repository', 'description', 'unpkg', 'keywords'],
  properties: {
    keywords: {
      type: 'array',
      enum: ['coveo-atomic-component'],
      description:
        'keywords should include "coveo-atomic-component" otherwise the component will not be indexed  TODO:',
    },
    description: {
      type: 'string',
      minLength: 20,
      description: 'TODO:',
    },
    repository: {
      description: 'TODO:',
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
