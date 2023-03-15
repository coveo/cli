import {z} from 'zod';

export default z.object({
  name: z.string({
    required_error: 'You should provide a name to your custom component',
  }),
  unpkg: z.string({
    required_error:
      'You should provide the path to the .esm.js file of your custom component. You can find it under the dist/ folder once you build the component',
  }),
  keywords: z
    .string()
    .array()
    .refine((keywords) => keywords.includes('coveo-atomic-component'), {
      message:
        'The package.json keywords should include "coveo-atomic-component", otherwise your component will not be listed along with other Coveo custom components. For more info, visit https://docs.npmjs.com/cli/v9/configuring-npm/package-json#keywords',
    })
    .describe(''),
  description: z
    .string({
      required_error:
        "You should provide a description of at least 20 characters explaining the component's purpose",
    })
    .min(20, {
      message:
        'The component description should be at least 20 characters long',
    }),
  repository: z.union(
    [
      z.string().url({
        message:
          'The provided repository URL is invalid. Please provide a valid URL',
      }),
      z.object({
        type: z.string(),
        url: z.string().url({
          message:
            'The provided repository URL is invalid. Please provide a valid URL',
        }),
      }),
    ],
    {
      required_error:
        'You need to provide an URL to the component source code. For more info, visit https://docs.npmjs.com/cli/v9/configuring-npm/package-json#repository',
    }
  ),
});
